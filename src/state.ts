export { initialState, reduceState, Tick, Movement}
import {State, Action, Viewport, Block, Tetromino, Position} from "./type.ts" 

const createTetorimino = (id: number, shape: Position[], color: String, position: {x: number, y: number}) : Tetromino => ({
  id: id,
  shape: shape,
  color: color,
  position: position
})

const initialState: State = {
    gameEnd: false,
    tetrominos: [createTetorimino(1, [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], "green", {x: 0, y: -1})],
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
          const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
          const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
          const stackedActiveTetrominos =  ((activeTetromino!.position.y + 2) * Block.HEIGHT) == Viewport.CANVAS_HEIGHT
          const stackedOnTetrominos = stackedTetrominos.some((stacked) => {
                  return activeTetromino!.shape.some((activeShape) => {
                    return stacked.shape.some((stackedShape) => {
                      return (
                        activeShape.x + activeTetromino!.position.x === stackedShape.x + stacked.position.x && 
                        activeShape.y + activeTetromino!.position.y + 1 === stackedShape.y + stacked.position.y
                        )
                    })
                  })
                });
          
          const tetrominosExceeded = stackedTetrominos.some((tetromino) =>
            tetromino.shape.some((shapePos) =>
              shapePos.y + tetromino.position.y <= 0
            )
          );

          if (tetrominosExceeded) {
            return {...s, gameEnd: true}
          }

          if (stackedActiveTetrominos || stackedOnTetrominos) {
            const newTetromino = createTetorimino(s.activeTetrominoId + 1, [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], "blue", {x: 0, y: 0})
            return {...s, tetrominos: [...s.tetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1}
          } else {
              activeTetromino!.position.y = activeTetromino!.position.y + 1
            return s
          }
        }
        return s
      }
}

class Movement implements Action {
    constructor(public readonly x: number, public readonly y: number) {}
    apply(s: State): State {
      const activeTetrominos = s.tetrominos.filter((tetromino) => tetromino.id == s.activeTetrominoId)
      const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
      const stackedActiveTetrominos = activeTetrominos.some((tetromino) => ((tetromino.position.y + 2) * Block.HEIGHT) == Viewport.CANVAS_HEIGHT)

      const stackedOnTetrominos = activeTetrominos.some((active) => {
          return stackedTetrominos.some((stacked) => {
            return active.shape.some((activeShape) => {
              return stacked.shape.some((stackedShape) => {
                return (
                  activeShape.x + active.position.x + this.x === stackedShape.x + stacked.position.x && 
                  activeShape.y + active.position.y + this.y === stackedShape.y + stacked.position.y
                  )
              })
            })
          });
      });

      const tetrominosExceeded = stackedTetrominos.some((tetromino) =>
        tetromino.shape.some((shapePos) =>
          shapePos.y + tetromino.position.y <= 0
        )
      );

      if (tetrominosExceeded) {
        return {...s, gameEnd: true}
      }

      if (stackedActiveTetrominos || stackedOnTetrominos) {
        const newTetromino = createTetorimino(s.activeTetrominoId + 1, [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], "blue", {x: 0, y: 0})
        return {...s, tetrominos: [...s.tetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1}
      } else {
        activeTetrominos.forEach((tetromino) => {
          if ((tetromino.position.x + this.x) * Block.WIDTH < 0 || (tetromino.position.x + this.x + 2) * Block.WIDTH > Viewport.CANVAS_WIDTH) {
            return tetromino
          } else {
            tetromino.position.x += this.x
            tetromino.position.y += this.y
          }
        })
      }
      return s
    }
}

const reduceState = (s: State, action: Action) => action.apply(s);