export type {State, Action, Key, Event, Tetromino, Position}
export {Viewport, Constants, Block}


/** Constants */
const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
} as const;

const Constants = {
  TICK_RATE_MS: 500,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
} as const;

const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

/** User input */

type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyR";

type Event = "keydown" | "keyup" | "keypress";

type Position = Readonly<{ x: number; y: number }>;

type Tetromino = Readonly<{
    id: number
    shape: Position[]
    color: String
    position: Position
}>


type State = Readonly<{
    gameEnd: boolean;
    tetrominos: ReadonlyArray<Tetromino>
    activeTetrominoId: number
    previewTetromino: Tetromino
    previewTetrominoId: number
    currentScore: number
    highScore: number
}>;

interface Action {
    apply(s: State): State;
}