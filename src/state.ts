export { initialState, reduceState, Tick, Movement}
import {State, Action, Viewport, Block, Tetromino, Position} from "./type.ts" 

const createTetorimino = (id: number, shape: Position[], color: String) : Tetromino => ({
  id: id,
  shape: shape,
  color: color,
  position: {x: 0, y: -1}
})

const initialState: State = {
    gameEnd: false,
    tetrominos: [createTetorimino(1, [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}], "green")],
    activeTetrominoId: 1
} as const;


class Tick implements Action {
    constructor() {}
      /** 
       * interval tick: bodies move, collisions happen, bullets expire
       * @param s old State
       * @returns new State
       */
      apply(s: State): State {
        if (!s.gameEnd) {
          const activeTetrominos = s.tetrominos.filter((tetromino) => tetromino.id == s.activeTetrominoId)
          const isStackTetrominos = activeTetrominos.filter((tetromino) => ((tetromino.position.y + 2) * Block.HEIGHT) >= Viewport.CANVAS_HEIGHT)
          if (isStackTetrominos.length != 0) {
            const newTetromino = createTetorimino(s.activeTetrominoId + 1, [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}], "blue")
            return {...s, tetrominos: [...s.tetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1}
          } else {
            activeTetrominos.forEach((tetromino) => {
              tetromino.position.y = tetromino.position.y + 1
            })
            return s
          }
          // s.tetrominos.map((tetromino) => {
          //   if (tetromino.id == s.activeTetrominoId) {
          //     if (((tetromino.position.y + 2) * Block.HEIGHT) >= Viewport.CANVAS_HEIGHT) {
          //       const newTetromino = createTetorimino(tetromino.id + 1, [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}], "blue")
          //       return {...s, tetrominos: [...s.tetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1}
          //     }
          //     tetromino.position.y = tetromino.position.y + 1
          //   }
          // })
          // return s
        }
        return s
      }
}

class Movement implements Action {
    constructor(public readonly x: number, public readonly y: number) {}
    apply(s: State): State {
      s.tetrominos.map((tetromino) => {
        if (tetromino.id == s.activeTetrominoId) {
          if (((tetromino.position.y + 2) * Block.HEIGHT) >= Viewport.CANVAS_HEIGHT) {
            return {...s, activeTetrominoId: s.activeTetrominoId + 1}
          } else {
            if ((tetromino.position.x + this.x) * Block.WIDTH < 0 || (tetromino.position.x + this.x + 2) * Block.WIDTH > Viewport.CANVAS_WIDTH) {
              return tetromino
            } else {
              tetromino.position.x += this.x
              tetromino.position.y += this.y
            }
          }
        }
      })
      return s
    }
}

const reduceState = (s: State, action: Action) => action.apply(s);