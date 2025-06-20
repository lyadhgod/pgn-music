import pgnParser from '@mliebelt/pgn-parser';
import type { ParseTree } from '@mliebelt/pgn-parser';

/**
 * Type representing a move in a parsed PGN game.
 * The parser's move objects may have either a 'notation' property (object) or a 'move' property (string).
 */
type PgnMove = { notation?: { col: string; row: string }; move?: string };

/**
 * Converts a single PGN move to a musical note (destination square as uppercase string).
 * Handles normal moves, castling, promotions, and invalid moves.
 *
 * @param move - The move object from the PGN parser.
 * @param moveIdx - The index of the move in the game (used to determine side for castling).
 * @returns The destination square as a musical note (e.g., 'E4', 'G1', 'C8'), or 'X' for unparseable moves.
 */
function getNoteFromMove(move: PgnMove, moveIdx: number): string {
  if (move && move.notation && move.notation.col && move.notation.row) {
    return (move.notation.col.toUpperCase() + move.notation.row);
  }
  if (move && typeof move.move === 'string' && /^O-O(-O)?([+#]{1,2})?$/.test(move.move)) {
    const isWhite = moveIdx % 2 === 0;
    if (/^O-O-O/.test(move.move)) {
      return isWhite ? 'C1' : 'C8';
    } else {
      return isWhite ? 'G1' : 'G8';
    }
  }
  if (move && typeof move.move === 'string') {
    const squareRegex = /^[a-h][1-8]$/i;
    const match = /([a-h][1-8])(?:=[QRBN])?(?:[+#]{1,2})?$/i.exec(move.move);
    if (match && squareRegex.test(match[1])) {
      return match[1].toUpperCase();
    }
  }
  return 'X';
}

/**
 * Converts all moves in a single parsed PGN game to musical notes.
 *
 * @param game - A single parsed PGN game (ParseTree).
 * @returns An array of musical notes (destination squares) for the game.
 */
function getMusicalNotesFromGame(game: ParseTree): string[] {
  const notes: string[] = [];
  if (!game.moves) return notes;
  for (let i = 0; i < game.moves.length; i++) {
    notes.push(getNoteFromMove(game.moves[i] as PgnMove, i));
  }
  return notes;
}

/**
 * Parses a PGN string and returns musical notes for each game.
 *
 * @param pgn - The PGN string to parse.
 * @returns An array of arrays, each containing the musical notes for a game.
 */
function getMusicalNotesFromPgnString(pgn: string): string[][] {
  let parsed: unknown;
  try {
    parsed = pgnParser.parseGames(pgn);
  } catch {
    try {
      parsed = pgnParser.parse(pgn, { startRule: 'games' });
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed) || !parsed.length) return [];
  return getMusicalNotesFromPgn(parsed as ParseTree[]);
}

/**
 * Converts an array of parsed PGN games to musical notes for each game.
 *
 * @param parsedPgn - Array of parsed PGN games (ParseTree[]).
 * @returns An array of arrays, each containing the musical notes for a game.
 */
function getMusicalNotesFromPgn(parsedPgn: ParseTree[]): string[][] {
  return parsedPgn.map(getMusicalNotesFromGame);
}

export { getMusicalNotesFromPgn, getMusicalNotesFromPgnString, getMusicalNotesFromGame, getNoteFromMove };
