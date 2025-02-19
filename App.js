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

const calculateValidMoves = (x, y, board) => {
  const moves = [];
  const piece = board[x][y];
  if (!piece) return moves;

  // Count pieces in the column (including all pieces)
  const N = board[x].filter(cell => cell).length;

  // Check all possible directions
  const directions = [
    [-N, -N], [-N, 0], [-N, N],
    [0, -N], [0, N],
    [N, -N], [N, 0], [N, N]
  ];

  directions.forEach(([dx, dy]) => {
    const newX = x + dx;
    const newY = y + dy;

    // Validate move is within board boundaries and not onto own piece
    if (
      newX >= 0 && newX < BOARD_SIZE.COLS &&
      newY >= 0 && newY < BOARD_SIZE.ROWS &&
      (!board[newX][newY] || board[newX][newY].player !== piece.player)
    ) {
      moves.push({ x: newX, y: newY });
    }
  });

  return moves;
};

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

  const handleSquarePress = (x, y) => {
    // If there's a winner, prevent any further moves
    if (gameState.winner) return;

    const piece = gameState.board[x][y];

    // If no piece is selected and the clicked square has current player's piece
    if (!gameState.selectedPiece && piece?.player === gameState.currentPlayer) {
      const validMoves = calculateValidMoves(x, y, gameState.board);
      setGameState(prev => ({
        ...prev,
        selectedPiece: { x, y },
        validMoves
      }));
      return;
    }

    // If a piece is selected and the clicked square is a valid move
    if (gameState.selectedPiece && 
        gameState.validMoves.some(move => move.x === x && move.y === y)) {
      const newBoard = JSON.parse(JSON.stringify(gameState.board));
      const { x: fromX, y: fromY } = gameState.selectedPiece;
      const movingPiece = newBoard[fromX][fromY];
      
      let player1Score = gameState.player1Score;
      let player2Score = gameState.player2Score;
      let crownHolder = gameState.crownHolder;
      
      if (newBoard[x][y]?.player) {
        if (newBoard[x][y].hasCrown) {
          movingPiece.hasCrown = true;
          crownHolder = gameState.currentPlayer;
        }
        
        if (newBoard[x][y].player === 1) player1Score--;
        else player2Score--;
      }

      let crownPosition = gameState.crownPosition;
      if (x === crownPosition?.x && y === crownPosition?.y && !crownHolder) {
        movingPiece.hasCrown = true;
        crownHolder = gameState.currentPlayer;
        crownPosition = null;
      }

      // Move the piece
      newBoard[x][y] = movingPiece;
      newBoard[fromX][fromY] = null;

      // Check win conditions
      let winner = null;
      const isHome = (gameState.currentPlayer === 1 && x === 3 && y === 3) ||
                    (gameState.currentPlayer === 2 && x === 11 && y === 3);
      
      if (movingPiece.hasCrown && isHome) {
        winner = gameState.currentPlayer;
      } else if (player1Score === 0) {
        winner = 2;
      } else if (player2Score === 0) {
        winner = 1;
      }

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        selectedPiece: null,
        validMoves: [],
        player1Score,
        player2Score,
        crownPosition,
        crownHolder,
        winner
      }));
    } else {
      // Deselect if clicking elsewhere
      setGameState(prev => ({
        ...prev,
        selectedPiece: null,
        validMoves: []
      }));
    }
  };

  const renderBoard = () => {
    const squares = [];
    const squareSize = boardSize.width / BOARD_SIZE.COLS;

    for (let y = 0; y < BOARD_SIZE.ROWS; y++) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE.COLS; x++) {
        const isHome1 = x === 3 && y === 3;
        const isHome2 = x === 11 && y === 3;
        const isCrown = gameState.crownPosition && 
                       x === gameState.crownPosition.x && 
                       y === gameState.crownPosition.y;
        const piece = gameState.board[x][y];
        const isSelected = gameState.selectedPiece?.x === x && 
                          gameState.selectedPiece?.y === y;
        const isValidMove = gameState.validMoves.some(
          move => move.x === x && move.y === y
        );

        row.push(
          <TouchableOpacity
            key={`${x}-${y}`}
            style={[
              styles.square,
              {
                width: squareSize,
                height: squareSize,
                backgroundColor: (x + y) % 2 === 0 ? 
                  darkTheme.colors.surface : '#2D2D2D',
              },
              isHome1 && { backgroundColor: darkTheme.colors.player1 },
              isHome2 && { backgroundColor: darkTheme.colors.player2 },
              isSelected && { backgroundColor: '#4A4A4A' },
              isValidMove && { backgroundColor: '#3D5AFE' }
            ]}
            onPress={() => handleSquarePress(x, y)}
          >
            {piece && (
              <View
                style={[
                  styles.piece,
                  { 
                    backgroundColor: piece.player === 1 ? 
                      darkTheme.colors.player1 : 
                      darkTheme.colors.player2 
                  },
                  piece.hasCrown && styles.crownHolder
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
          <Text style={[styles.playerText, { color: darkTheme.colors.player1 }]}>
            Player 1: {gameState.player1Score}
          </Text>
          <Text 
            style={[
              styles.turnText, 
              { 
                color: gameState.currentPlayer === 1 ? 
                  darkTheme.colors.player1 : 
                  darkTheme.colors.player2 
              }
            ]}
          >
            {gameState.winner ? (
              <View style={styles.winnerContainer}>
                <Text style={styles.winnerText}>{`Player ${gameState.winner} Wins!`}</Text>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => setGameState(initialGameState)}
                >
                  <Text style={styles.resetButtonText}>Reset Game</Text>
                </TouchableOpacity>
              </View>
            ) : (
              `Player ${gameState.currentPlayer}'s Turn`
            )}
          </Text>
          <Text style={[styles.playerText, { color: darkTheme.colors.player2 }]}>
            Player 2: {gameState.player2Score}
          </Text>
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
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  crownHolder: {
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  resetButton: {
    backgroundColor: darkTheme.colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5
  },
  resetButtonText: {
    color: darkTheme.colors.text,
    fontSize: 14,
    fontWeight: 'bold'
  },
  winnerText: {
    color: darkTheme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold'
  }
});
