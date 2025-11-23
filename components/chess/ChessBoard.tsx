import BottomSheet from "@gorhom/bottom-sheet";
import { Chess, Square } from "chess.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { AIFactory, ChessAI } from "./ai/ChessAI";
import { CheckBadge } from "./CheckBadge";
import { DraggablePiece, DraggablePieceRef } from "./DraggablePiece";
import { GameOverDialog } from "./GameOverDialog";
import { PromotionDialog } from "./PromotionDialog";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOARD_SIZE = SCREEN_WIDTH; // Use full width
const SQUARE_SIZE = BOARD_SIZE / 8;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

interface ChessBoardProps {
  orientation?: "white" | "black";
  /** Enable computer opponent */
  vsComputer?: boolean;
  /** Which color the computer plays (defaults to 'black') */
  computerColor?: "white" | "black";
  /** AI type to use */
  aiType?: "random" | "stockfish";
  /** Callback to expose reset function */
  onResetReady?: (resetFn: () => void) => void;
  /** Test mode - start with a checkmate position */
  testCheckmate?: boolean;
  /** Show file and rank coordinates on the board */
  showCoordinates?: boolean;
  /** Bottom sheet ref for move history */
  bottomSheetRef?: React.RefObject<BottomSheet | null>;
  /** Callback when move history changes */
  onMoveHistoryChange?: (moves: string[]) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  orientation = "white",
  vsComputer = false,
  computerColor = "black",
  aiType = "random",
  onResetReady,
  testCheckmate = false,
  showCoordinates = true,
  bottomSheetRef: externalBottomSheetRef,
  onMoveHistoryChange,
}) => {
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [hoverSquare, setHoverSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [kingInCheckSquare, setKingInCheckSquare] = useState<Square | null>(
    null
  );
  const [attackingSquares, setAttackingSquares] = useState<Square[]>([]);
  const [checkPathSquares, setCheckPathSquares] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMoveFrom, setLastMoveFrom] = useState<Square | null>(null);
  const [lastMoveTo, setLastMoveTo] = useState<Square | null>(null);
  const boardRef = useRef<View>(null);
  const boardPosition = useRef({ x: 0, y: 0 });
  const draggedPieceSquare = useRef<Square | null>(null);
  const ai = useRef<ChessAI>(AIFactory.createAI(aiType));
  const activePieceRef = useRef<DraggablePieceRef | null>(null);
  const pieceRefs = useRef<Map<string, DraggablePieceRef>>(new Map());
  const bottomSheetRef = useRef<BottomSheet>(null);

  const updateBoard = useCallback(() => {
    setBoard(chess.board());
    const history = chess.history();
    setMoveHistory(history);

    // Notify parent component of move history changes
    if (onMoveHistoryChange) {
      onMoveHistoryChange(history);
    }

    // Track last move for highlighting
    const verboseHistory = chess.history({ verbose: true });
    if (verboseHistory.length > 0) {
      const lastMove = verboseHistory[verboseHistory.length - 1];
      setLastMoveFrom(lastMove.from);
      setLastMoveTo(lastMove.to);
    } else {
      setLastMoveFrom(null);
      setLastMoveTo(null);
    }

    // Find the king square and attacking pieces if in check
    if (chess.isCheck() && !chess.isCheckmate()) {
      const currentTurn = chess.turn();
      const boardState = chess.board();
      let kingSquare: Square | null = null;

      // Find the king
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = boardState[rank][file];
          if (piece && piece.type === "k" && piece.color === currentTurn) {
            kingSquare = `${FILES[file]}${RANKS[rank]}` as Square;
            break;
          }
        }
        if (kingSquare) break;
      }

      if (kingSquare) {
        setKingInCheckSquare(kingSquare);

        // Find pieces that are attacking the king and calculate path
        const attackers: Square[] = [];
        const pathSquares: Square[] = [];

        // Temporarily switch turn to check which pieces can attack the king
        const originalTurn = currentTurn;
        const fen = chess.fen();
        const fenParts = fen.split(" ");
        fenParts[1] = currentTurn === "w" ? "b" : "w"; // Switch turn
        const tempFen = fenParts.join(" ");

        try {
          chess.load(tempFen);

          for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
              const square = `${FILES[file]}${RANKS[rank]}` as Square;
              const piece = boardState[rank][file];

              // Check if this piece is attacking the king
              if (piece && piece.color !== originalTurn) {
                const moves = chess.moves({ square, verbose: true });
                if (moves.some((move) => move.to === kingSquare)) {
                  attackers.push(square);

                  // Calculate path between attacker and king
                  const attackerFile = file;
                  const attackerRank = rank;
                  const kingFile = FILES.indexOf(kingSquare[0]);
                  const kingRank = RANKS.indexOf(kingSquare[1]);

                  // Determine direction
                  const fileDir = Math.sign(kingFile - attackerFile);
                  const rankDir = Math.sign(kingRank - attackerRank);

                  // Add squares between attacker and king (for sliding pieces)
                  let currentFile = attackerFile + fileDir;
                  let currentRank = attackerRank + rankDir;

                  while (currentFile !== kingFile || currentRank !== kingRank) {
                    const pathSquare =
                      `${FILES[currentFile]}${RANKS[currentRank]}` as Square;
                    pathSquares.push(pathSquare);
                    currentFile += fileDir;
                    currentRank += rankDir;
                  }
                }
              }
            }
          }
        } finally {
          // Restore original position
          chess.load(fen);
        }

        console.log("King square:", kingSquare);
        console.log("Attacking squares:", attackers);
        console.log("Path squares:", pathSquares);
        setAttackingSquares(attackers);
        setCheckPathSquares(pathSquares);
      }
    } else {
      setKingInCheckSquare(null);
      setAttackingSquares([]);
      setCheckPathSquares([]);
    }
  }, [chess, onMoveHistoryChange]);

  const resetGame = useCallback(() => {
    chess.reset();
    setBoard(chess.board());
    setSelectedSquare(null);
    setHoverSquare(null);
    setLegalMoves([]);
    setIsComputerThinking(false);
    setShowPromotionDialog(false);
    setPendingMove(null);
    setShowGameOverDialog(false);
    setMoveHistory([]);
    setLastMoveFrom(null);
    setLastMoveTo(null);
    draggedPieceSquare.current = null;
    activePieceRef.current = null;
  }, [chess]);

  // Expose reset function to parent
  useEffect(() => {
    if (onResetReady) {
      onResetReady(resetGame);
    }
  }, [onResetReady, resetGame]);

  // Check for game over
  useEffect(() => {
    if (chess.isGameOver()) {
      setShowGameOverDialog(true);
    }
  }, [board, chess]);

  // Set up test checkmate position
  useEffect(() => {
    if (testCheckmate) {
      // Check position with king and queen far apart
      // White king on e1, Black queen on e7 delivering check vertically
      // Clear path from e7 to e1
      chess.load("rnb1kbnr/ppppqppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1");
      updateBoard();
    }
  }, [testCheckmate, chess, updateBoard]);

  const handlePromotionSelect = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!pendingMove) return;

      try {
        const move = chess.move({
          from: pendingMove.from,
          to: pendingMove.to,
          promotion: piece,
        });

        if (move) {
          updateBoard();
        }
      } catch (error) {
        console.error("Promotion move error:", error);
      }

      setShowPromotionDialog(false);
      setPendingMove(null);
    },
    [chess, pendingMove, updateBoard]
  );

  const makeComputerMove = useCallback(async () => {
    if (!vsComputer || chess.isGameOver()) {
      return;
    }

    const currentTurn = chess.turn();
    const shouldComputerMove =
      (computerColor === "white" && currentTurn === "w") ||
      (computerColor === "black" && currentTurn === "b");

    if (!shouldComputerMove) {
      return;
    }

    setIsComputerThinking(true);

    try {
      const move = await ai.current.getMove(chess);
      chess.move(move);
      updateBoard();
    } catch (error) {
      console.error("AI move error:", error);
    } finally {
      setIsComputerThinking(false);
    }
  }, [chess, vsComputer, computerColor, updateBoard]);

  // Trigger computer move after player moves
  useEffect(() => {
    if (vsComputer && !chess.isGameOver() && !isComputerThinking) {
      const currentTurn = chess.turn();
      const isComputerTurn =
        (computerColor === "white" && currentTurn === "w") ||
        (computerColor === "black" && currentTurn === "b");

      if (isComputerTurn) {
        makeComputerMove();
      }
    }
  }, [
    board,
    vsComputer,
    computerColor,
    chess,
    isComputerThinking,
    makeComputerMove,
  ]);

  const getSquareFromCoordinates = useCallback(
    (x: number, y: number): Square | null => {
      const relativeX = x - boardPosition.current.x;
      const relativeY = y - boardPosition.current.y;

      if (
        relativeX < 0 ||
        relativeY < 0 ||
        relativeX >= BOARD_SIZE ||
        relativeY >= BOARD_SIZE
      ) {
        return null;
      }

      const fileIndex = Math.floor(relativeX / SQUARE_SIZE);
      const rankIndex = Math.floor(relativeY / SQUARE_SIZE);

      if (fileIndex < 0 || fileIndex > 7 || rankIndex < 0 || rankIndex > 7) {
        return null;
      }

      // Map visual position to chess notation
      const file = FILES[fileIndex];
      const rank = RANKS[rankIndex];
      const square = `${file}${rank}` as Square;

      return square;
    },
    []
  );

  const handleDragStart = useCallback(
    (file: number, rank: number, pieceRef: DraggablePieceRef | null) => {
      // Don't allow moves while computer is thinking
      if (isComputerThinking) {
        return;
      }
      console.log("drag start!");
      const square = `${FILES[file]}${RANKS[rank]}` as Square;
      const piece = chess.get(square);

      // In vs computer mode, only allow moving your own color
      if (vsComputer) {
        const playerColor = computerColor === "white" ? "b" : "w";
        if (piece && piece.color !== playerColor) {
          return;
        }
      }

      if (piece && piece.color === chess.turn()) {
        // Reset the previously active piece if it's different
        if (activePieceRef.current && activePieceRef.current !== pieceRef) {
          activePieceRef.current.reset();
        }

        // Set the new active piece
        activePieceRef.current = pieceRef;

        draggedPieceSquare.current = square;
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
      }
    },
    [chess, isComputerThinking, vsComputer, computerColor]
  );

  const handleDragMove = useCallback(
    (x: number, y: number) => {
      console.log("drag move!");
      const square = getSquareFromCoordinates(x, y);
      setHoverSquare(square);
    },
    [getSquareFromCoordinates]
  );

  const handleDragEnd = useCallback(
    (x: number, y: number) => {
      const toSquare = getSquareFromCoordinates(x, y);
      const fromSquare = draggedPieceSquare.current;

      if (!toSquare || !fromSquare) {
        setSelectedSquare(null);
        setHoverSquare(null);
        setLegalMoves([]);
        draggedPieceSquare.current = null;
        return;
      }

      // Don't try to move if dragged to the same square
      if (toSquare === fromSquare) {
        setSelectedSquare(null);
        setHoverSquare(null);
        setLegalMoves([]);
        draggedPieceSquare.current = null;
        return;
      }

      // Check if this is a pawn promotion move
      const piece = chess.get(fromSquare);
      const isPromotion =
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && toSquare[1] === "8") ||
          (piece.color === "b" && toSquare[1] === "1"));

      if (isPromotion) {
        // Check if the move is legal before showing promotion dialog
        const moves = chess.moves({ square: fromSquare, verbose: true });
        const isLegalMove = moves.some((m) => m.to === toSquare);

        if (isLegalMove) {
          setPendingMove({ from: fromSquare, to: toSquare });
          setShowPromotionDialog(true);
          setSelectedSquare(null);
          setHoverSquare(null);
          setLegalMoves([]);
          draggedPieceSquare.current = null;
          return;
        }
      }

      try {
        const move = chess.move({
          from: fromSquare,
          to: toSquare,
        });

        if (move) {
          updateBoard();
        }
      } catch (error) {
        // Invalid move - piece will snap back
      }

      setSelectedSquare(null);
      setHoverSquare(null);
      setLegalMoves([]);
      draggedPieceSquare.current = null;
      activePieceRef.current = null;
    },
    [chess, updateBoard, getSquareFromCoordinates]
  );

  const renderSquare = (file: number, rank: number) => {
    const isLight = (file + rank) % 2 === 0;
    const square = `${FILES[file]}${RANKS[rank]}` as Square;
    const piece = board[rank][file];
    const isSelected = selectedSquare === square;
    const isHovered = hoverSquare === square;
    const isLegalMove = legalMoves.includes(square);
    const isKingInCheck = kingInCheckSquare === square;
    const isAttackingSquare = attackingSquares.includes(square);
    const isCheckPath = checkPathSquares.includes(square);
    const isLastMoveFrom = lastMoveFrom === square;
    const isLastMoveTo = lastMoveTo === square;

    // Calculate absolute position of square center
    const squareCenterX =
      boardPosition.current.x + file * SQUARE_SIZE + SQUARE_SIZE / 2;
    const squareCenterY =
      boardPosition.current.y + rank * SQUARE_SIZE + SQUARE_SIZE / 2;

    const pieceKey = `${file}-${rank}`;

    // Show file label on bottom rank
    const showFileLabel = orientation === "white" ? rank === 7 : rank === 0;
    // Show rank label on leftmost file
    const showRankLabel = orientation === "white" ? file === 0 : file === 7;

    return (
      <View
        key={pieceKey}
        style={[
          styles.square,
          { width: SQUARE_SIZE, height: SQUARE_SIZE },
          isLight ? styles.lightSquare : styles.darkSquare,
          isLastMoveFrom && styles.lastMoveFromSquare,
          isLastMoveTo && styles.lastMoveToSquare,
          isCheckPath && styles.checkPathSquare,
          isSelected && styles.selectedSquare,
          isHovered && styles.selectedSquare,
          isAttackingSquare && styles.attackingSquare,
          isKingInCheck && styles.kingInCheckSquare,
        ]}
      >
        {piece && (
          <DraggablePiece
            ref={(ref) => {
              if (ref) {
                pieceRefs.current.set(pieceKey, ref);
              } else {
                pieceRefs.current.delete(pieceKey);
              }
            }}
            piece={piece.type}
            color={piece.color}
            squareSize={SQUARE_SIZE}
            squareCenterX={squareCenterX}
            squareCenterY={squareCenterY}
            onDragStart={() =>
              handleDragStart(
                file,
                rank,
                pieceRefs.current.get(pieceKey) || null
              )
            }
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />
        )}
        {isLegalMove && (
          <View
            style={[
              styles.legalMoveIndicator,
              piece ? styles.captureIndicator : styles.moveIndicator,
            ]}
          />
        )}
        {/* File label */}
        {showCoordinates && showFileLabel && (
          <Text
            style={[
              styles.coordinateLabel,
              isLight ? styles.coordinateDark : styles.coordinateLight,
              styles.fileCoordinate,
            ]}
          >
            {FILES[file]}
          </Text>
        )}
        {/* Rank label */}
        {showCoordinates && showRankLabel && (
          <Text
            style={[
              styles.coordinateLabel,
              isLight ? styles.coordinateDark : styles.coordinateLight,
              styles.rankCoordinate,
            ]}
          >
            {RANKS[rank]}
          </Text>
        )}
      </View>
    );
  };

  const handleOpenMoveHistory = useCallback(() => {
    const sheetRef = externalBottomSheetRef || bottomSheetRef;
    sheetRef.current?.snapToIndex(0); // Open to peek view
  }, [externalBottomSheetRef]);

  const displayRanks = orientation === "white" ? RANKS : [...RANKS].reverse();
  const displayFiles = orientation === "white" ? FILES : [...FILES].reverse();

  return (
    <View style={styles.container}>
      <View
        ref={boardRef}
        style={styles.board}
        onLayout={(event) => {
          boardRef.current?.measureInWindow((x, y) => {
            boardPosition.current = { x, y };
          });
        }}
      >
        {displayRanks.map((rankLabel, rankIndex) => (
          <View key={rankLabel} style={styles.row}>
            {displayFiles.map((fileLabel, fileIndex) => {
              const actualRank =
                orientation === "white" ? rankIndex : 7 - rankIndex;
              const actualFile =
                orientation === "white" ? fileIndex : 7 - fileIndex;
              return renderSquare(actualFile, actualRank);
            })}
          </View>
        ))}
      </View>
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.turnText}>
            Turn: {chess.turn() === "w" ? "White" : "Black"}
          </Text>
          <Pressable
            style={styles.historyButton}
            onPress={handleOpenMoveHistory}
          >
            <Text style={styles.historyButtonText}>
              Move History ({moveHistory.length})
            </Text>
          </Pressable>
        </View>
        <View style={styles.badgeContainer}>
          <CheckBadge visible={chess.isCheck() && !chess.isCheckmate()} />
        </View>
      </View>
      <PromotionDialog
        visible={showPromotionDialog}
        color={pendingMove ? chess.get(pendingMove.from)?.color || "w" : "w"}
        onSelect={handlePromotionSelect}
      />
      <GameOverDialog
        visible={showGameOverDialog}
        winner={
          chess.isCheckmate()
            ? chess.turn() === "w"
              ? "black"
              : "white"
            : null
        }
        isDraw={chess.isDraw()}
        onPlayAgain={resetGame}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  },
  row: {
    flexDirection: "row",
  },
  square: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coordinateLabel: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "600",
  },
  coordinateLight: {
    color: "#E8E7D3",
  },
  coordinateDark: {
    color: "#557396",
  },
  fileCoordinate: {
    bottom: 2,
    right: 2,
  },
  rankCoordinate: {
    top: 2,
    left: 2,
  },
  lightSquare: {
    backgroundColor: "#E8E7D3",
  },
  darkSquare: {
    backgroundColor: "#557396",
  },
  selectedSquare: {
    backgroundColor: "#baca44",
    borderWidth: 4,
    borderColor: "#f6f669",
  },
  kingInCheckSquare: {
    backgroundColor: "#b13e3a",
    borderWidth: 4,
    borderColor: "#cc241f",
    shadowColor: "#cc241f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  attackingSquare: {
    backgroundColor: "#cc7c1f",
    borderWidth: 3,
    borderColor: "#e77e04",
    shadowColor: "#e77e04",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  checkPathSquare: {
    borderWidth: 3,
    borderColor: "#e77e04",
  },
  lastMoveFromSquare: {
    backgroundColor: "#cdd26a",
  },
  lastMoveToSquare: {
    backgroundColor: "#a8ad52",
  },
  dropTarget: {
    backgroundColor: "rgba(130, 151, 105, 0.8)",
    borderWidth: 4,
    borderColor: "#f6f669",
    shadowColor: "#f6f669",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  legalMoveIndicator: {
    position: "absolute",
    borderRadius: 100,
  },
  moveIndicator: {
    width: SQUARE_SIZE * 0.3,
    height: SQUARE_SIZE * 0.3,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  captureIndicator: {
    width: SQUARE_SIZE * 0.9,
    height: SQUARE_SIZE * 0.9,
    borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 0.3)",
  },
  info: {
    marginTop: 20,
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  historyButton: {
    backgroundColor: "#557396",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  historyButtonText: {
    color: "#E8E7D3",
    fontSize: 14,
    fontWeight: "600",
  },
  badgeContainer: {
    height: 48,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  turnText: {
    color: "#FFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkText: {
    fontSize: 16,
    color: "#ff6b6b",
    fontWeight: "bold",
  },
});
