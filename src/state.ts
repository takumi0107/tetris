export { initialState, reduceState, Tick, Movement}
import {State, Action, Viewport, Block, Tetromino} from "./type.ts" 

const createTetorimino = (id: number) : Tetromino => ({
  id: id,
  isStacked: false,
  position: {x: 0, y: -1}
})

const initialState: State = {
    gameEnd: false,
    tetrominos: [createTetorimino(1)]
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
          s.tetrominos.map((tetromino) => {
            if (!tetromino.isStacked) {
              tetromino.position.y = tetromino.position.y + 1
            }
          })
          return s
        }
        return s
      }
}

class Movement implements Action {
    constructor(public readonly x: number, public readonly y: number) {}
    apply(s: State): State {
      s.tetrominos.map((tetromino) => {
        if (!tetromino.isStacked) {
          if ((tetromino.position.x + this.x) * Block.WIDTH < 0 || (tetromino.position.x + this.x + 1) * Block.WIDTH > Viewport.CANVAS_WIDTH) {
            return s
          } else {
            tetromino.position.x += this.x
            tetromino.position.y += this.y
          }
        }
      })
      return s
        // if ((s.position.x + this.x) * Block.WIDTH < 0 || (s.position.x + this.x + 2) * Block.WIDTH > Viewport.CANVAS_WIDTH) {
        //   return s
        // } else {
        //   return {...s, position: {x: s.position.x + this.x, y: s.position.y + this.y}}
        // }
    }
}

const reduceState = (s: State, action: Action) => action.apply(s);