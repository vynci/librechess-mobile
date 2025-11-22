import { Chess } from 'chess.js';

/**
 * Interface for chess AI implementations
 * This allows easy swapping between different AI engines
 */
export interface ChessAI {
  /**
   * Get the best move for the current position
   * @param chess - The current chess game state
   * @param difficulty - Optional difficulty level (interpretation depends on AI)
   * @returns Promise resolving to the chosen move in SAN notation (e.g., "e4", "Nf3")
   */
  getMove(chess: Chess, difficulty?: number): Promise<string>;

  /**
   * Get the name of this AI implementation
   */
  getName(): string;
}

/**
 * Simple random move AI
 * Chooses a random legal move from the current position
 * Good for testing and beginners
 */
export class RandomAI implements ChessAI {
  getName(): string {
    return 'Random AI';
  }

  async getMove(chess: Chess, difficulty?: number): Promise<string> {
    // Get all legal moves
    const moves = chess.moves();

    if (moves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Add a small delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));

    // Pick a random move
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }
}

/**
 * Placeholder for future Stockfish AI implementation
 * When you want to upgrade, implement this class
 */
export class StockfishAI implements ChessAI {
  getName(): string {
    return 'Stockfish AI';
  }

  async getMove(chess: Chess, difficulty: number = 10): Promise<string> {
    // TODO: Implement Stockfish integration
    // For now, fall back to random moves
    console.warn('Stockfish AI not implemented yet, using random moves');
    const randomAI = new RandomAI();
    return randomAI.getMove(chess, difficulty);
  }
}

/**
 * AI Factory - makes it easy to switch between different AI implementations
 */
export class AIFactory {
  static createAI(type: 'random' | 'stockfish' = 'random'): ChessAI {
    switch (type) {
      case 'random':
        return new RandomAI();
      case 'stockfish':
        return new StockfishAI();
      default:
        return new RandomAI();
    }
  }
}
