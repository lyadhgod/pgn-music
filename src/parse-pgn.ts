import pgnParser from '@mliebelt/pgn-parser';
import type { ParseTree } from '@mliebelt/pgn-parser';
import { PgnMove } from '@mliebelt/pgn-types';

interface Option {
  chromatic?: boolean;
}

/**
 * Default configuration options for musical note conversion.
 * Uses natural notes (A-G) without chromatic alterations.
 */
const defaultOption: Required<Option> = {
  chromatic: false,
};

/**
 * Converts a single PGN move to a musical note (destination square as uppercase string).
 * Handles normal moves, castling, promotions, and invalid moves.
 *
 * @param move - The move object from the PGN parser.
 * @param moveIdx - The index of the move in the game (used to determine side for castling).
 * @param option - Configuration options for note conversion. When chromatic is true,
 *                 maps chess files (A-H) and ranks (1-8) to chromatic musical notes.
 *                 When false, uses natural notes only, treating H files as A.
 * @returns The destination square as a musical note. In chromatic mode, returns notes
 *          like 'A#3', 'C#4'. In natural mode, returns notes like 'E4', 'G1', 'C8'.
 *          Returns 'X' for unparseable moves which can represent a musical rest or mute.
 */
function getNoteFromMove(
  move: PgnMove,
  moveIdx: number,
  option: Option = defaultOption
): string {
  // Default to X
  let note = 'X';

  // Get note from col and row if available
  if (move && move.notation && move.notation.col && move.notation.row) {
    note = (move.notation.col.toUpperCase() + move.notation.row);
  }
  // Get note from castling notation
  else if (move && typeof move.notation.notation === 'string' && /^O-O(-O)?([+#]{1,2})?$/.test(move.notation.notation)) {
    const isWhite = moveIdx % 2 === 0;
    if (/^O-O-O/.test(move.notation.notation)) {
      note = isWhite ? 'C1' : 'C8';
    } else {
      note = isWhite ? 'G1' : 'G8';
    }
  }
  // Get note from promotion notation
  else if (move && typeof move.notation.notation === 'string') {
    const squareRegex = /^[a-h][1-8]$/i;
    const match = /([a-h][1-8])(?:=[QRBN])?(?:[+#]{1,2})?$/i.exec(move.notation.notation);
    if (match && squareRegex.test(match[1])) {
      note = match[1].toUpperCase();
    }
  }

  if (note !== 'X') {
    const file = note.charAt(0);
    const rank = parseInt(note.charAt(1), 10);

    if (option.chromatic) {
      /**
       * Maps chess board files (A-H) and ranks (1-8) to chromatic musical notes.
       * Each file corresponds to a musical scale starting from different base notes.
       * Ranks 1-8 map to sequential chromatic steps within each scale.
       * 
       * Note: H files are treated as extended A files in a higher octave range,
       * as H is sometimes used in chess notation for the 8th file.
       */
      const noteMap = {
        'A': ['A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4'],
        'B': ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4'],
        'C': ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'],
        'D': ['D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4'],
        'E': ['E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'],
        'F': ['F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'],
        'G': ['G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5'],
        'H': ['A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5'], // Treat H as A of higher octave
      };

      note = noteMap[file as keyof typeof noteMap][rank - 1];
    } else if (file === 'H'){
      note = 'A' + rank; // Treat H as A
    }
  }

  return note;
}

/**
 * Converts all moves in a single parsed PGN game to musical notes.
 *
 * @param game - A single parsed PGN game (ParseTree).
 * @param option - Configuration options for note conversion. Determines whether to use
 *                 chromatic or natural note mapping.
 * @returns An array of musical notes (destination squares) for the game.
 */
function getMusicalNotesFromGame(
  game: ParseTree,
  option: Option = defaultOption
): string[] {
  const notes: string[] = [];
  if (!game.moves) return notes;
  for (let i = 0; i < game.moves.length; i++) {
    notes.push(getNoteFromMove(game.moves[i] as PgnMove, i, option));
  }
  return notes;
}

/**
 * Parses a PGN string and returns musical notes for each game.
 *
 * @param pgn - The PGN string to parse. Can contain single or multiple games.
 * @param option - Configuration options for note conversion. Determines whether to use
 *                 chromatic or natural note mapping for all games.
 * @returns An array of arrays, each containing the musical notes for a game.
 */
function getMusicalNotesFromPgnString(
  pgn: string,
  option: Option = defaultOption
): string[][] {
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
  return getMusicalNotesFromPgn(parsed as ParseTree[], option);
}

/**
 * Converts an array of parsed PGN games to musical notes for each game.
 *
 * @param parsedPgn - Array of parsed PGN games (ParseTree[]).
 * @param option - Configuration options for note conversion. Determines whether to use
 *                 chromatic or natural note mapping for all games.
 * @returns An array of arrays, each containing the musical notes for a game.
 */
function getMusicalNotesFromPgn(
  parsedPgn: ParseTree[],
  option: Option = defaultOption
): string[][] {
  return parsedPgn.map(game => getMusicalNotesFromGame(game, option));
}

export {
  getMusicalNotesFromPgn,
  getMusicalNotesFromPgnString,
  getMusicalNotesFromGame,
  getNoteFromMove
};
