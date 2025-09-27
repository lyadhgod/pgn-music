import { getMusicalNotesFromPgn, getMusicalNotesFromPgnString, getMusicalNotesFromGame, getNoteFromMove } from '../src/parse-pgn';

// Helper to create a minimal game object for tests
const makeParsedGame = (moves: string[]): any[] => [{
  comments_above_header: [],
  headers: [],
  comments: [],
  result: '*',
  moves: moves.map(move => ({ notation: { notation: move }, comments: [] })),
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
        { notation: { notation: 'e4' }, comments: [] },
        { notation: { notation: 'e5' }, comments: [] },
        { notation: { notation: 'Nf3' }, comments: [] },
        { notation: { notation: 'Nc6' }, comments: [] },
        { notation: { notation: 'Bb5' }, comments: [] },
        { notation: { notation: 'a6' }, comments: [] },
        { notation: { notation: 'Ba4' }, comments: [] },
        { notation: { notation: 'Nf6' }, comments: [] },
        { notation: { notation: 'O-O' }, comments: [] },
        { notation: { notation: 'Be7' }, comments: [] },
        { notation: { notation: 'Re1' }, comments: [] },
        { notation: { notation: 'b5' }, comments: [] },
        { notation: { notation: 'Bb3' }, comments: [] },
        { notation: { notation: 'd6' }, comments: [] },
        { notation: { notation: 'c3' }, comments: [] },
        { notation: { notation: 'O-O' }, comments: [] }
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
        { notation: { notation: 'e8=Q#' }, comments: [] },
        { notation: { notation: 'a1=R+' }, comments: [] },
        { notation: { notation: 'h1=N' }, comments: [] },
        { notation: { notation: 'O-O-O' }, comments: [] }
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
        { notation: { notation: '??' }, comments: [] },
        { notation: { notation: 'O-O' }, comments: [] }
      ],
      result: '*'
    };
    expect(getMusicalNotesFromGame(game)).toEqual(['X', 'G8']);
  });
});

describe('getNoteFromMove', () => {
  it('returns correct note for normal moves', () => {
    expect(getNoteFromMove({ notation: { notation: 'e4' }, comments: [] } as any, 0)).toBe('E4');
    expect(getNoteFromMove({ notation: { notation: 'Nc6' }, comments: [] } as any, 3)).toBe('C6');
    expect(getNoteFromMove({ notation: { notation: 'Bb5' }, comments: [] } as any, 4)).toBe('B5');
  });
  it('handles castling for white and black', () => {
    expect(getNoteFromMove({ notation: { notation: 'O-O' }, comments: [] } as any, 8)).toBe('G1'); // white
    expect(getNoteFromMove({ notation: { notation: 'O-O' }, comments: [] } as any, 9)).toBe('G8'); // black
    expect(getNoteFromMove({ notation: { notation: 'O-O-O' }, comments: [] } as any, 0)).toBe('C1'); // white
    expect(getNoteFromMove({ notation: { notation: 'O-O-O' }, comments: [] } as any, 1)).toBe('C8'); // black
  });
  it('handles promotions and checks', () => {
    expect(getNoteFromMove({ notation: { notation: 'e8=Q#' }, comments: [] } as any, 0)).toBe('E8');
    expect(getNoteFromMove({ notation: { notation: 'a1=R+' }, comments: [] } as any, 1)).toBe('A1');
    expect(getNoteFromMove({ notation: { notation: 'h1=N' }, comments: [] } as any, 2)).toBe('H1');
  });
  it('returns X for unparseable moves', () => {
    expect(getNoteFromMove({ notation: { notation: '??' }, comments: [] } as any, 0)).toBe('X');
    expect(getNoteFromMove({ notation: { notation: '' }, comments: [] } as any, 1)).toBe('X');
  });
});