import { getMusicalNotesFromPgn, getMusicalNotesFromPgnString, getMusicalNotesFromGame, getNoteFromMove } from '../src/parse-pgn';

// Helper to create a minimal game object for tests
const makeParsedGame = (moves: string[]): any[] => [{
  comments_above_header: [],
  headers: [],
  comments: [],
  result: '*',
  moves: moves.map(move => ({ move, comments: [] })),
}];

describe('getMusicalNotesFromPgn', () => {
  it('handles simple moves', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['e4', 'e5', 'Nf3', 'Nc6']))).toEqual([['E4', 'E5', 'F3', 'C6']]);
  });
  it('handles captures', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['Nxe5', 'Qxd4']))).toEqual([['E5', 'D4']]);
  });
  it('handles check and checkmate', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['Qh5+', 'Ke7', 'Qxe5#']))).toEqual([['H5', 'E7', 'E5']]);
  });
  it('handles pawn promotion', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['e8=Q', 'd1=N', 'a1=R+', 'h8=B#']))).toEqual([['E8', 'D1', 'A1', 'H8']]);
  });
  it('handles castling', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['O-O', 'O-O', 'O-O-O', 'O-O-O']))).toEqual([['G1', 'G8', 'C1', 'C8']]);
  });
  it('handles ambiguous/invalid moves with fallback', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['??', '']))).toEqual([['X', 'X']]);
  });
  it('handles checkmate by castling', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['O-O#', 'O-O++', 'O-O-O#', 'O-O-O++']))).toEqual([['G1', 'G8', 'C1', 'C8']]);
  });
  it('handles checkmate with ++ notation', () => {
    expect(getMusicalNotesFromPgn(makeParsedGame(['e8++', 'a1=Q++']))).toEqual([['E8', 'A1']]);
  });
  it('getMusicalNotesFromPgnString returns correct notes from PGN string', () => {
    const pgn = `
[Event "Test"]
[Site "?"]
[Date "2020.01.01"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *`;
    expect(getMusicalNotesFromPgnString(pgn)).toEqual([['E4', 'E5', 'F3', 'C6', 'B5', 'A6']]);
  });
  it('getMusicalNotesFromPgnString returns empty array for empty PGN', () => {
    expect(getMusicalNotesFromPgnString('')).toEqual([]);
  });
  it('getMusicalNotesFromPgnString handles multiple games', () => {
    const pgn = `
[Event "Game1"]
[Site "?"]
[Date "2020.01.01"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 *

[Event "Game2"]
[Site "?"]
[Date "2020.01.02"]
[Round "2"]
[White "C"]
[Black "D"]
[Result "*"]

1. d4 d5 2. c4 c6 *`;
    expect(getMusicalNotesFromPgnString(pgn)).toEqual([
      ['E4', 'E5', 'F3', 'C6'],
      ['D4', 'D5', 'C4', 'C6'],
    ]);
  });
});

describe('getMusicalNotesFromPgn (multi-game support)', () => {
  it('returns a list of notes for each game', () => {
    const games = makeParsedGame(['e4', 'e5']);
    const games2 = makeParsedGame(['d4', 'd5']);
    // Simulate two games in the array
    const result = getMusicalNotesFromPgn([...games, ...games2]);
    expect(result).toEqual([
      ['E4', 'E5'],
      ['D4', 'D5'],
    ]);
  });
});

describe('getMusicalNotesFromPgnString (multi-game support)', () => {
  it('returns a list of notes for each game', () => {
    const pgn = `
[Event "Game1"]
[Site "?"]
[Date "2020.01.01"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 *

[Event "Game2"]
[Site "?"]
[Date "2020.01.02"]
[Round "2"]
[White "C"]
[Black "D"]
[Result "*"]

1. d4 d5 2. c4 c6 *`;
    expect(getMusicalNotesFromPgnString(pgn)).toEqual([
      ['E4', 'E5', 'F3', 'C6'],
      ['D4', 'D5', 'C4', 'C6'],
    ]);
  });
});

describe('getMusicalNotesFromGame', () => {
  it('should return correct notes for a simple game', () => {
    const game: any = {
      comments_above_header: null,
      headers: null,
      comments: null,
      moves: [
        { move: 'e4', comments: [] },
        { move: 'e5', comments: [] },
        { move: 'Nf3', comments: [] },
        { move: 'Nc6', comments: [] },
        { move: 'Bb5', comments: [] },
        { move: 'a6', comments: [] },
        { move: 'Ba4', comments: [] },
        { move: 'Nf6', comments: [] },
        { move: 'O-O', comments: [] },
        { move: 'Be7', comments: [] },
        { move: 'Re1', comments: [] },
        { move: 'b5', comments: [] },
        { move: 'Bb3', comments: [] },
        { move: 'd6', comments: [] },
        { move: 'c3', comments: [] },
        { move: 'O-O', comments: [] }
      ],
      result: '*'
    };
    expect(getMusicalNotesFromGame(game)).toEqual([
      'E4', 'E5', 'F3', 'C6', 'B5', 'A6', 'A4', 'F6', 'G1', 'E7', 'E1', 'B5', 'B3', 'D6', 'C3', 'G8'
    ]);
  });
  it('should handle promotions and checks', () => {
    const game: any = {
      comments_above_header: null,
      headers: null,
      comments: null,
      moves: [
        { move: 'e8=Q#', comments: [] },
        { move: 'a1=R+', comments: [] },
        { move: 'h1=N', comments: [] },
        { move: 'O-O-O', comments: [] }
      ],
      result: '*'
    };
    expect(getMusicalNotesFromGame(game)).toEqual(['E8', 'A1', 'H1', 'C8']);
  });
  it('should return X for unparseable moves', () => {
    const game: any = {
      comments_above_header: null,
      headers: null,
      comments: null,
      moves: [
        { move: '??', comments: [] },
        { move: 'O-O', comments: [] }
      ],
      result: '*'
    };
    expect(getMusicalNotesFromGame(game)).toEqual(['X', 'G8']);
  });
});

describe('getNoteFromMove', () => {
  it('returns correct note for normal moves', () => {
    expect(getNoteFromMove({ move: 'e4', comments: [] } as any, 0)).toBe('E4');
    expect(getNoteFromMove({ move: 'Nc6', comments: [] } as any, 3)).toBe('C6');
    expect(getNoteFromMove({ move: 'Bb5', comments: [] } as any, 4)).toBe('B5');
  });
  it('handles castling for white and black', () => {
    expect(getNoteFromMove({ move: 'O-O', comments: [] } as any, 8)).toBe('G1'); // white
    expect(getNoteFromMove({ move: 'O-O', comments: [] } as any, 9)).toBe('G8'); // black
    expect(getNoteFromMove({ move: 'O-O-O', comments: [] } as any, 0)).toBe('C1'); // white
    expect(getNoteFromMove({ move: 'O-O-O', comments: [] } as any, 1)).toBe('C8'); // black
  });
  it('handles promotions and checks', () => {
    expect(getNoteFromMove({ move: 'e8=Q#', comments: [] } as any, 0)).toBe('E8');
    expect(getNoteFromMove({ move: 'a1=R+', comments: [] } as any, 1)).toBe('A1');
    expect(getNoteFromMove({ move: 'h1=N', comments: [] } as any, 2)).toBe('H1');
  });
  it('returns X for unparseable moves', () => {
    expect(getNoteFromMove({ move: '??', comments: [] } as any, 0)).toBe('X');
    expect(getNoteFromMove({ move: '', comments: [] } as any, 1)).toBe('X');
  });
});