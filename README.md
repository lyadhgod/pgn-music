# pgn-music

A TypeScript npm library for reading chess PGN, parsing and converting the destination squares of all moves into musical notes. The library provides utility functions to parse PGN strings and outputs the move destinations (as uppercase strings, representing musical notes) for each game, making it easy to analyze or transform chess games into musical sequences or for further applications.

## Features
- Parse PGN strings
- Outputs parsed PGN as Javascript/Typescript object
- Utility functions for programmatic access to parsed data (musical notes)

## Installation

```sh
npm install pgn-music
```

## Usage

### Parse a PGN string

```typescript
import { getMusicalNotesFromPgnString } from 'pgn-music';

const pgn = `
[Event "Test"]
[Site "?"]
[Date "2020.01.01"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *`;

const notes = getMusicalNotesFromPgnString(pgn);
console.log(notes); // ['E4', 'E5', 'F3', 'C6', 'B5', 'A6']
```

### Advanced: Parse already-parsed PGN or single games

```typescript
import { getMusicalNotesFromPgn, getMusicalNotesFromGame, getNoteFromMove } from 'pgn-music';

// getMusicalNotesFromPgn: Convert parsed PGN array to notes
// getMusicalNotesFromGame: Convert a single parsed game to notes
// getNoteFromMove: Convert a single move to a note
```

## API

### `getMusicalNotesFromPgnString(pgn: string, option?: Option): string[][]`
Parses a PGN string and returns an array of arrays of musical notes (destination squares) for each game.

### `getMusicalNotesFromPgn(parsedPgn: ParseTree[], option?: Option): string[][]`
Converts an array of parsed PGN games to musical notes for each game.

### `getMusicalNotesFromGame(game: ParseTree, option?: Option): string[]`
Converts all moves in a single parsed PGN game to musical notes.

### `getNoteFromMove(move: PgnMove, moveIdx: number, option?: Option): string`
Converts a single PGN move to a musical note (destination square as uppercase string).
