export { initialState, reduceState, Tick, Movement, Rotation, Reset}
import {State, Action, Viewport, Block, Tetromino, Position} from "./type.ts" 

const createTetorimino = (id: number, shape: Position[], color: String, position: {x: number, y: number}) : Tetromino => ({
  id: id,
  shape: shape,
  color: color,
  position: position,
})

const initialState: State = {
    gameEnd: false,
    tetrominos: [createTetorimino(1, [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0} , {x: 1, y: 1}], "green", {x: 0, y: -1})],
    activeTetrominoId: 1,
    currentScore: 0,
    highScore: 0
} as const;

const checAndDeletekRow = (activeHight: number, AllTetrominos: Tetromino[], activeTetromino: Tetromino) => {
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
  const filteredDropedTetrominos = filteredNewTetrominos.map((tetromino) => {
    const hight = tetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
    while (!(stackedActiveTetrominos(tetromino, hight) || stackedOnTetrominos(filteredNewTetrominos, tetromino))) {
      const newPosition = { x: tetromino.position.x, y: tetromino.position.y + 1 };
      tetromino = { ...tetromino, position: newPosition };
    }
    return tetromino
  })
  const delRowsNum = deleteRows.filter(row => row != undefined).length
  return {filteredNewTetrominos: filteredDropedTetrominos, delRowsNum: delRowsNum}
}

const stackedActiveTetrominos = (activeTetromino: Tetromino, hight: number) => {
   return ((activeTetromino.position.y + hight) * Block.HEIGHT) >= Viewport.CANVAS_HEIGHT
}

const stackedOnTetrominos = (stackedTetrominos: Tetromino[], activeTetromino: Tetromino) => {
  return stackedTetrominos.some((stacked) => {
    return activeTetromino.shape.some((activeShape) => {
      return stacked.shape.some((stackedShape) => {
        if (activeTetromino.id == stacked.id) {
          return false
        }
        return (
          activeShape.x + activeTetromino.position.x == stackedShape.x + stacked.position.x && 
          activeShape.y + activeTetromino.position.y + 1 == stackedShape.y + stacked.position.y
          )
      })
    })
  })
}

const widthExceeded = (activeTetromino: Tetromino, width: number, addWidth: number) => {
  return ((activeTetromino.position.x + addWidth) * Block.WIDTH < 0 || 
  (activeTetromino.position.x + addWidth + width) * Block.WIDTH > Viewport.CANVAS_WIDTH)
}

const tetrominosExceeded = (stackedTetrominos: Tetromino[]) => {
  return stackedTetrominos.some((tetromino) =>
    tetromino.shape.some((shapePos) =>
      shapePos.y + tetromino.position.y <= 0
    )
  );
}

const whenStack = (s: State, activeTetromino: Tetromino, AllTetrominos: Tetromino[], activeHight: number) => {
  const checkedAndDeleteResult = checAndDeletekRow(activeHight, AllTetrominos, activeTetromino)
  const checkedTetrominos = checkedAndDeleteResult.filteredNewTetrominos
  const delRowsNum = checkedAndDeleteResult.delRowsNum
  const currentScore = s.currentScore + delRowsNum * 100
  const highScore = currentScore > s.highScore? currentScore : s.highScore
  const newTetromino = createTetorimino(s.activeTetrominoId + 1, [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}], "blue", {x: 0, y: -1})
  return {...s, tetrominos: [...checkedTetrominos, newTetromino], activeTetrominoId: s.activeTetrominoId + 1, currentScore: currentScore, highScore: highScore}
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
              return whenStack(s, activeTetromino, AllTetrominos, activeHight)
            } else {
              return {...s, 
                tetrominos: [...stackedTetrominos, {...activeTetromino, position: {x: activeTetromino.position.x, y: activeTetromino.position.y + 1}}]}
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
            return whenStack(s, activeTetromino, AllTetrominos, activeHight)
          } else {
              if (widthExceeded(activeTetromino, activeWidth, this.x)) {
                return s
              } else {
                return {...s, 
                  tetrominos: [...stackedTetrominos, {...activeTetromino, position: {x: activeTetromino.position.x + this.x, y: activeTetromino.position.y + this.y}}]}
              }
          }
        }
      }
      return s
    }
}

class Rotation implements Action {
  //  Super rotation system
  constructor() {};
  apply(s: State):State {
    if (!s.gameEnd) {
      const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
      if (activeTetromino) {
        const activeShapeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0)
        const activeShapeWidth = activeTetromino.shape.reduce((maxX, crr) => Math.max(maxX, crr.x), 0)
        const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
        const AllTetrominos = stackedTetrominos.concat(activeTetromino)

        const rotateImpossible = activeTetromino.shape.some((shape) => {
          const newX = activeShapeHight - shape.y
          const newY = shape.x
          return stackedActiveTetrominos(activeTetromino, newY) || stackedOnTetrominos(stackedTetrominos, activeTetromino) || widthExceeded(activeTetromino, activeShapeWidth, newX)
        })
        
        if (!rotateImpossible) {
          const newShape =activeTetromino.shape.map((shape) => {
            const tempX = shape.x
            return {
              x: activeShapeHight - shape.y,
              y: tempX
            }
          })
          return {...s, tetrominos: [...stackedTetrominos, {...activeTetromino, shape: newShape}]}
        }
        
        
      }
    }
    return s
  }
}

class Reset implements Action {
  constructor() {};
  apply(s: State):State {
    if (s.gameEnd) {
      return {...initialState, tetrominos: [createTetorimino(1, [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0} , {x: 1, y: 1}], "green", {x: 0, y: -1})]}
    }
    return s
  }
}
const reduceState = (s: State, action: Action) => action.apply(s);