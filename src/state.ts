export { initialState, reduceState, Tick, Movement}
import {State, Action, Viewport, Block, Tetromino, Position} from "./type.ts" 

const createTetorimino = (id: number, shape: Position[], color: String, position: {x: number, y: number}) : Tetromino => ({
  id: id,
  shape: shape,
  color: color,
  position: position,
})

const initialState: State = {
    gameEnd: false,
    tetrominos: [createTetorimino(1, [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], "green", {x: 0, y: -1})],
    activeTetrominoId: 1,
    score: 0
} as const;

const checkRow = (activeHight: number, AllTetrominos: Tetromino[], activeTetromino: Tetromino) => {
  const deleteRows = Array.from({ length: activeHight }, (v, i) => {
    const matchingShapePos = AllTetrominos
    .flatMap((tetromino) =>  // I refere to chatgpt here, i asked "how to do filter position of tetromino in chekRowTetrominos"
      tetromino.shape
        .map((shapePos) => ({
          ...shapePos,
          offsetY: shapePos.y + tetromino.position.y,
        }))
    )
    .filter((pos) => pos.offsetY == i + activeTetromino.position.y);
    if (matchingShapePos.length == Viewport.CANVAS_WIDTH / Block.WIDTH) {
      const deleteRow = matchingShapePos[0].offsetY
      return deleteRow
    }
  });
  const newTetrominos = AllTetrominos.map((tetromino) => {
    const newShape = tetromino.shape.filter(
        (shapePos) => !deleteRows.includes(shapePos.y + tetromino.position.y)
    );
    return { ...tetromino, shape: newShape };
  });
  const filteredNewTetrominos = newTetrominos.filter((tetromino) => tetromino.shape.length != 0);
  const delRowsNum = deleteRows.filter(row => row != undefined).length
  return {filteredNewTetrominos: filteredNewTetrominos, delRowsNum: delRowsNum}
}

const stackedActiveTetrominos = (activeTetromino: Tetromino, activeHight: number) => {
   return ((activeTetromino.position.y + activeHight) * Block.HEIGHT) == Viewport.CANVAS_HEIGHT
}

const stackedOnTetrominos = (stackedTetrominos: Tetromino[], activeTetromino: Tetromino) => {
  return stackedTetrominos.some((stacked) => {
    return activeTetromino.shape.some((activeShape) => {
      return stacked.shape.some((stackedShape) => {
        return (
          activeShape.x + activeTetromino.position.x === stackedShape.x + stacked.position.x && 
          activeShape.y + activeTetromino.position.y + 1 === stackedShape.y + stacked.position.y
          )
      })
    })
  })
}

const tetrominosExceeded = (stackedTetrominos: Tetromino[]) => {
  return stackedTetrominos.some((tetromino) =>
    tetromino.shape.some((shapePos) =>
      shapePos.y + tetromino.position.y <= 0
    )
  );
}

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
          if (activeTetromino) {
            const activeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
            const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
            const AllTetrominos = stackedTetrominos.concat(activeTetromino)

            if (tetrominosExceeded(stackedTetrominos)) {
              return {...s, gameEnd: true}
            }
  
            if (stackedActiveTetrominos(activeTetromino, activeHight) || stackedOnTetrominos(stackedTetrominos, activeTetromino)) {
              const checkedResult = checkRow(activeHight, AllTetrominos, activeTetromino)
              const checkedTetrominos = checkedResult.filteredNewTetrominos
              const delRowsNum = checkedResult.delRowsNum
              const score = s.score + delRowsNum * 100
              const newTetromino = createTetorimino(s.activeTetrominoId + 1, [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], "blue", {x: 0, y: 0})
              return {...s, tetrominos: [...checkedTetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1, score: score}
            } else {
                activeTetromino.position.y = activeTetromino.position.y + 1
              return s
            }
          }
        }
        return s
      }
}

class Movement implements Action {
    constructor(public readonly x: number, public readonly y: number) {}
    apply(s: State): State {
      if (!s.gameEnd) {
        const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
        if (activeTetromino) {
          const activeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
          const activeWidth = activeTetromino.shape.reduce((maxX, crr) => Math.max(maxX, crr.x), 0) + 1
          const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
          const AllTetrominos = stackedTetrominos.concat(activeTetromino)
    
          if (tetrominosExceeded(stackedTetrominos)) {
            return {...s, gameEnd: true}
          }
    
          if (stackedActiveTetrominos(activeTetromino, activeHight) || stackedOnTetrominos(stackedTetrominos, activeTetromino)) {
            const checkedResult = checkRow(activeHight, AllTetrominos, activeTetromino)
            const checkedTetrominos = checkedResult.filteredNewTetrominos
            const delRowsNum = checkedResult.delRowsNum
            const score = s.score + delRowsNum * 100
            const newTetromino = createTetorimino(s.activeTetrominoId + 1, [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], "blue", {x: 0, y: 0})
            return {...s, tetrominos: [...checkedTetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1, score: score}
          } else {
              if ((activeTetromino.position.x + this.x) * Block.WIDTH < 0 || (activeTetromino.position.x + this.x + activeWidth) * Block.WIDTH > Viewport.CANVAS_WIDTH) {
                return s
              } else {
                activeTetromino.position.x += this.x
                activeTetromino.position.y += this.y
              }
          }
          return s
        }
      }
      return s
    }
}

const reduceState = (s: State, action: Action) => action.apply(s);