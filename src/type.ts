export type {State, Action, Key, Event, Tetromino}
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

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

type Tetromino = Readonly<{
    id: number,
    isStacked: boolean
    position: {x: number, y: number}
}>


type State = Readonly<{
    gameEnd: boolean;
    tetrominos: ReadonlyArray<Tetromino>
}>;

interface Action {
    apply(s: State): State;
}