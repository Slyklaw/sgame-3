import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#BB86FC',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    player1: '#4CAF50',
    player2: '#F44336',
  },
};

const BOARD_SIZE = {
  COLS: 15,
  ROWS: 7,
};

const initialGameState = {
  currentPlayer: 1,
  player1Score: 4,
  player2Score: 4,
  winner: null,
  board: Array(BOARD_SIZE.COLS).fill(null).map(() => Array(BOARD_SIZE.ROWS).fill(null)),
  selectedPiece: null,
  validMoves: [],
  crownPosition: { x: 7, y: 3 },
  crownHolder: null,
};

// Initialize player pieces
initialGameState.board[3][2] = { player: 1 };
initialGameState.board[4][3] = { player: 1 };
initialGameState.board[3][4] = { player: 1 };
initialGameState.board[2][3] = { player: 1 };

initialGameState.board[11][2] = { player: 2 };
initialGameState.board[12][3] = { player: 2 };
initialGameState.board[11][4] = { player: 2 };
initialGameState.board[10][3] = { player: 2 };

export default function App() {
  const [gameState, setGameState] = useState(initialGameState);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    const size = Math.min(width / BOARD_SIZE.COLS, height / (BOARD_SIZE.ROWS + 2));
    setBoardSize({
      width: size * BOARD_SIZE.COLS,
      height: size * BOARD_SIZE.ROWS,
    });
  }, []);

  const renderBoard = () => {
    const squares = [];
    const squareSize = boardSize.width / BOARD_SIZE.COLS;

    for (let y = 0; y < BOARD_SIZE.ROWS; y++) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE.COLS; x++) {
        const isHome1 = x === 3 && y === 3;
        const isHome2 = x === 11 && y === 3;
        const isCrown = x === gameState.crownPosition.x && y === gameState.crownPosition.y;
        const piece = gameState.board[x][y];

        row.push(
          <TouchableOpacity
            key={`${x}-${y}`}
            style={[
              styles.square,
              {
                width: squareSize,
                height: squareSize,
                backgroundColor: (x + y) % 2 === 0 ? darkTheme.colors.surface : '#2D2D2D',
              },
              isHome1 && { backgroundColor: darkTheme.colors.player1 },
              isHome2 && { backgroundColor: darkTheme.colors.player2 },
            ]}
          >
            {piece && (
              <View
                style={[
                  styles.piece,
                  { backgroundColor: piece.player === 1 ? darkTheme.colors.player1 : darkTheme.colors.player2 },
                ]}
              />
            )}
            {isCrown && !gameState.crownHolder && (
              <View style={styles.crown} />
            )}
          </TouchableOpacity>
        );
      }
      squares.push(
        <View key={`row-${y}`} style={styles.row}>
          {row}
        </View>
      );
    }
    return squares;
  };

  return (
    <PaperProvider theme={darkTheme}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.playerText}>Player 1: {gameState.player1Score}</Text>
          <Text style={styles.turnText}>Player {gameState.currentPlayer}'s Turn</Text>
          <Text style={styles.playerText}>Player 2: {gameState.player2Score}</Text>
        </View>
        <View
          style={[
            styles.board,
            {
              width: boardSize.width,
              height: boardSize.height,
            },
          ]}
        >
          {renderBoard()}
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  playerText: {
    color: darkTheme.colors.text,
    fontSize: 16,
  },
  turnText: {
    color: darkTheme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  board: {
    borderWidth: 2,
    borderColor: darkTheme.colors.primary,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(187, 134, 252, 0.1)',
  },
  piece: {
    width: '80%',
    height: '80%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: darkTheme.colors.text,
  },
  crown: {
    width: '60%',
    height: '60%',
    backgroundColor: darkTheme.colors.primary,
    borderRadius: 5,
  },
});
