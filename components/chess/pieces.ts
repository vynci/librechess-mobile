// Chess piece Unicode symbols
export const PIECE_SYMBOLS: Record<string, string> = {
  'K': '♔', // White King
  'Q': '♕', // White Queen
  'R': '♖', // White Rook
  'B': '♗', // White Bishop
  'N': '♘', // White Knight
  'P': '♙', // White Pawn
  'k': '♚', // Black King
  'q': '♛', // Black Queen
  'r': '♜', // Black Rook
  'b': '♝', // Black Bishop
  'n': '♞', // Black Knight
  'p': '♟', // Black Pawn
};

export const getPieceSymbol = (piece: string | null): string => {
  if (!piece) return '';
  return PIECE_SYMBOLS[piece] || '';
};
