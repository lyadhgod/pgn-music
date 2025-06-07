// Basic smoke test for the main entry point
import * as exported from '../src/index';

describe('index.ts exports', () => {
  it('should export all main API functions', () => {
    expect(typeof exported.getMusicalNotesFromPgn).toBe('function');
    expect(typeof exported.getMusicalNotesFromPgnString).toBe('function');
    expect(typeof exported.getMusicalNotesFromGame).toBe('function');
    expect(typeof exported.getNoteFromMove).toBe('function');
  });
});
