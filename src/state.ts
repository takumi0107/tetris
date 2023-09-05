export { initialState, reduceState, Tick, Movement, Rotation, Reset, HardDrop}
import { pipe, scan, map } from "rxjs";
import {State, Action, Viewport, Constants, Block, Tetromino, Position} from "./type.ts" 
import { RNG, RandomBlock } from "./util.ts";

const randomBlock = new RandomBlock()

const initialState = randomBlock.createInitialState(1)

/**
 * This function checks for completed rows in the game and deletes them if found.
 * It updates the game state with removed rows and falling tetrominos.
 *
 * @param s - The current game state.
 * @param activeHeight - The height of the active tetromino.
 * @param allTetrominos - An array of all tetrominos in the game.
 * @param activeTetromino - The active tetromino that is currently being controlled.
 * @returns An object containing the updated game state, filtered tetrominos, and the number of deleted rows.
 */
const checAndDeletekRow = (s: State, activeHight: number, allTetrominos: Tetromino[], activeTetromino: Tetromino) => {
  // Calculate the rows to be deleted based on matching shape positions.
  const deleteRows = Array.from({ length: activeHight }, (v, i) => {
    const matchingShapePos = allTetrominos
    .flatMap((tetromino) =>  // I refere to chatgpt here, i asked "how to do filter position of tetromino in chekRowTetrominos"
      tetromino.shape
        .map((shapePos) => ({
          ...shapePos,
          offsetY: shapePos.y + tetromino.position.y,
        }))
    )
    .filter((pos) => pos.offsetY == i + activeTetromino.position.y);
    // Check if a row is complete and return as a deleteRow.
    if (matchingShapePos.length == Viewport.CANVAS_WIDTH / Block.WIDTH) {
      const deleteRow = matchingShapePos[0].offsetY
      return deleteRow
    }
  });

  // Count the number of deleted rows.
  const delRowsNum = deleteRows.filter(row => row != undefined).length

  // Remove the completed rows from each tetromino's shapes.
  const newTetrominos = allTetrominos.map((tetromino) => {
    const newShape = tetromino.shape.filter(
        (shapePos) => !deleteRows.includes(shapePos.y + tetromino.position.y)
    );
    return { ...tetromino, shape: newShape };
  });
  const filteredNewTetrominos = newTetrominos.filter((tetromino) => tetromino.shape.length != 0);

  // Check the game level and update tetrominos
  const levelCheck = checkLevel(s, delRowsNum, filteredNewTetrominos)
  const levelCheckedTetrominos = levelCheck.allTetrominos

  // drop the tetrominos until they are stacked on others or floor.
  const filteredDropedTetrominos = levelCheckedTetrominos.reduce((acc: Tetromino[], tetromino: Tetromino) => {
    const hight = tetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
    while (!(stackedActiveTetrominos(tetromino, hight) || stackedOnTetrominos(acc, tetromino, 0, 1))) {
      const newPosition = { x: tetromino.position.x, y: tetromino.position.y + 1 }
      tetromino = { ...tetromino, position: newPosition }
    }
  return [...acc, tetromino]
  }, [])

  return {state: levelCheck.state, filteredNewTetrominos: filteredDropedTetrominos, delRowsNum: delRowsNum}
}

/**
 * This function checks the current game level and create obstacle block.
 *
 * @param s - The current game state.
 * @param delRowsNum - The number of rows deleted in the current action.
 * @param allTetrominos - An array of all tetrominos in the game.
 * @returns An object containing the updated game state and modified tetrominos based on the game level.
 */
const checkLevel = (s: State, delRowsNum: number, allTetrominos: Tetromino[]) => {
  // game level is until 7
  if (s.level <= 7) {
    const newLevelRows = s.levelRows + delRowsNum

    // if user delete 3 lines in each level create obstacle line and it cannot disappear.
    if (newLevelRows >= 3) {
      // Move all tetrominos one line up, creating an obstacle line at the bottom.
      const oneLineUpTetrominos = allTetrominos.map((tetromino) => {
        return {...tetromino, position: {x: tetromino.position.x, y: tetromino.position.y - 1}}
      })
      const obstacleLine = [randomBlock.randomObsShape(0-s.level, s.hashVal, 20 - s.level)]
      // By concatination in the front of oneLineUpTetrominos, obstacle line will never cleared
      const obsOneUpTetrominos = obstacleLine.concat(oneLineUpTetrominos)
      // reset the levelRows counter
      const newState = {...s, level: s.level + 1, levelRows: 0}
      return {state: newState, allTetrominos: obsOneUpTetrominos}
    }

    // Increment the levelRows counter.
    const newState = {...s, levelRows: s.levelRows + delRowsNum}
    return {state: newState, allTetrominos: allTetrominos}
  }
  // Return the current game state if the level is already at the maximum value.
  return {state: s, allTetrominos: allTetrominos}
}

/**
 * This function checks if the active tetromino has stacked to the bottom of the game grid.
 *
 * @param activeTetromino - The active tetromino currently in play.
 * @param height - The height of the active tetromino.
 * @returns A boolean value indicating whether the active tetromino is stacked at the bottom.
 */
const stackedActiveTetrominos = (activeTetromino: Tetromino, hight: number) => {
   return ((activeTetromino.position.y + hight) * Block.HEIGHT) >= Viewport.CANVAS_HEIGHT
}


/**
 * This function checks if the active tetromino is stacked on top of other tetrominos.
 *
 * @param stackedTetrominos - An array of tetrominos that are already placed on the game grid or other tetrominos.
 * @param activeTetromino - The active tetromino currently in play.
 * @param xMove - The horizontal movement to be tested.
 * @param yMove - The vertical movement to be tested.
 * @returns A boolean value indicating whether the active tetromino is stacked on top of other tetrominos after the specified movement.
 */
const stackedOnTetrominos = (stackedTetrominos: Tetromino[], activeTetromino: Tetromino, xMove: number, yMove: number) => {
  return stackedTetrominos.some((stacked) => {
    return activeTetromino.shape.some((activeShape) => {
      return stacked.shape.some((stackedShape) => {
         // Skip if the active tetromino is the same as the stacked one.
        if (activeTetromino.id == stacked.id) {
          return false
        }
        // Check for a collision by comparing the active and stacked shapes after adding xMove and yMove.
        return (
          activeShape.x + activeTetromino.position.x + xMove == stackedShape.x + stacked.position.x && 
          activeShape.y + activeTetromino.position.y + yMove == stackedShape.y + stacked.position.y
          )
      })
    })
  })
}

/**
 * This function checks if the active tetromino exceeds the game grid's horizontal boundaries after a movement.
 *
 * @param activeTetromino - The active tetromino currently in play.
 * @param width - The width of the active tetromino.
 * @param addWidth - The additional width to consider in the check.
 * @returns A boolean value indicating whether the active tetromino exceeds the game grid's horizontal boundaries.
 */
const widthExceeded = (activeTetromino: Tetromino, width: number, addWidth: number) => {
  return ((activeTetromino.position.x + addWidth) * Block.WIDTH < 0 || 
  (activeTetromino.position.x + addWidth + width) * Block.WIDTH > Viewport.CANVAS_WIDTH)
}

/**
 * This function checks if any part of the stacked tetrominos has exceeded the game grid's top boundary.
 *
 * @param stackedTetrominos - An array of tetrominos that are already placed on the game grid.
 * @returns A boolean value indicating whether any part of the stacked tetrominos exceeds the game grid's top boundary.
 */
const tetrominosExceeded = (stackedTetrominos: Tetromino[]) => {
  return stackedTetrominos.some((tetromino) =>
    tetromino.shape.some((shapePos) =>
      shapePos.y + tetromino.position.y <= 0
    )
  );
}


/**
 * This function handles the game state update when the active tetromino becomes stacked.
 *
 * @param s - The current game state.
 * @param activeTetromino - The active tetromino that has become stacked.
 * @param allTetrominos - An array of all tetrominos in the game.
 * @param activeHeight - The height of the active tetromino.
 * @returns An updated game state after the stacking event.
 */
const whenStack = (s: State, activeTetromino: Tetromino, allTetrominos: Tetromino[], activeHight: number) => {
  const checkedAndDeleteResult = checAndDeletekRow(s, activeHight, allTetrominos, activeTetromino)
  const checkedTetrominos = checkedAndDeleteResult.filteredNewTetrominos
  const delRowsNum = checkedAndDeleteResult.delRowsNum
  const currentScore = s.currentScore + delRowsNum * 100
  const highScore = currentScore > s.highScore? currentScore : s.highScore
  // change hash value before using for creating random block
  const newHash = RNG.hash(s.hashVal)
  const newTetromino = randomBlock.createRandomBlock(s.previewTetrominoId + 1, newHash)
  // Return an updated game state.
  return {
    ...checkedAndDeleteResult.state, 
    tetrominos: [...checkedTetrominos, s.previewTetromino], 
    activeTetrominoId: s.activeTetrominoId + 1, 
    previewTetromino: newTetromino, 
    previewTetrominoId: s.previewTetrominoId + 1,
    currentScore: currentScore, highScore: highScore,
    hashVal: newHash
  }
}

/**
 * This class represents an action that occor for each interval
 */
class Tick implements Action {
    constructor() {}
    /** 
     * This method is called on each game tick and updates the game state.
     *
     * @param s - The old game state.
     * @returns The new game state after processing the tick.
     */
      apply(s: State): State {
        if (!s.gameEnd) {
          // Find the active tetromino in the game state.
          const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
          if (activeTetromino) {
            // Calculate the height of active tetromino.
            const activeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
            // Filter for the stacked tetrominos from all tetrominos.
            const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
            // Concatenate the active tetromino with the stacked tetrominos
            const allTetrominos = stackedTetrominos.concat(activeTetromino)

            // Check if any stacked tetrominos exceed the top of the game grid.
            if (tetrominosExceeded(stackedTetrominos)) {
              return {...s, gameEnd: true}
            }
  
            // Check for collisions with the active tetromino and floor or other tetrominos.
            if (stackedActiveTetrominos(activeTetromino, activeHight) || stackedOnTetrominos(stackedTetrominos, activeTetromino, 0, 1)) {
              return whenStack(s, activeTetromino, allTetrominos, activeHight)
            } else {
              // Move the active tetromino down by one row.
              return {...s, 
                tetrominos: [...stackedTetrominos, {...activeTetromino, position: {x: activeTetromino.position.x, y: activeTetromino.position.y + 1}}]}
            }
          }
        }
        return s
      }
}

/**
 * This class represents an action for moving the active tetromino.
 */
class Movement implements Action {
    /**
     * Creates a new instance of the `Movement` action.
     *
     * @param x - The horizontal movement (e.g., -1 for left, 1 for right).
     * @param y - The vertical movement (e.g., 1 for downward movement).
     */
    constructor(public readonly x: number, public readonly y: number) {}

    /**
     * This method is called to apply the movement action to the game state.
     *
     * @param s - The current game state.
     * @returns The updated game state after applying the movement.
     */
    apply(s: State): State {
      if (!s.gameEnd) {
        const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
        if (activeTetromino) {
          const activeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
          const activeWidth = activeTetromino.shape.reduce((maxX, crr) => Math.max(maxX, crr.x), 0) + 1
          const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
          const allTetrominos = stackedTetrominos.concat(activeTetromino)
    
          // Check if any stacked tetrominos exceed the top of the game grid.
          if (tetrominosExceeded(stackedTetrominos)) {
            return {...s, gameEnd: true}
          }
    
          // Check for collisions with the active tetromino.
          if (stackedActiveTetrominos(activeTetromino, activeHight) || stackedOnTetrominos(stackedTetrominos, activeTetromino, 0, 1)) {
            return whenStack(s, activeTetromino, allTetrominos, activeHight)
          } else {
              // Check if the movement would exceed the game grid's boundaries or cause a collision
              if (widthExceeded(activeTetromino, activeWidth, this.x)|| stackedOnTetrominos(stackedTetrominos, activeTetromino, this.x, this.y)) {
                return s
              } else {
                // update active tetromino position
                return {...s, 
                  tetrominos: [...stackedTetrominos, {...activeTetromino, position: {x: activeTetromino.position.x + this.x, y: activeTetromino.position.y + this.y}}]}
              }
          }
        }
      }
      return s
    }
}
/**
 * This class represents an action for rotating the active tetromino.
 * I used Super Rotation System
 */
class Rotation implements Action {
  //  Super rotation system
  constructor() {};
  /**
   * This method is called to apply the rotation action to the game state.
   *
   * @param s - The current game state.
   * @returns The updated game state after applying the rotation.
   */
  apply(s: State):State {
    if (!s.gameEnd) {
      const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
      if (activeTetromino) {
        const activeShapeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0)
        const activeShapeWidth = activeTetromino.shape.reduce((maxX, crr) => Math.max(maxX, crr.x), 0)
        const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
        const allTetrominos = stackedTetrominos.concat(activeTetromino)

        // Check if the rotation is impossible due to collisions or exceeding boundaries.
        const rotateImpossible = activeTetromino.shape.some((shape) => {
          const newX = activeShapeHight - shape.y
          const newY = shape.x
          return stackedActiveTetrominos(activeTetromino, newY) || stackedOnTetrominos(stackedTetrominos, activeTetromino, 0, 1) 
          || stackedOnTetrominos(stackedTetrominos, activeTetromino, newX, newY) || widthExceeded(activeTetromino, activeShapeWidth, newX)
        })
        
        if (!rotateImpossible) {
          // Apply the rotation
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

/**
 * This class represents an action for resetting the game state after a game over.
 */
class Reset implements Action {
  constructor() {};
  /**
   * This method is called to apply the reset action to the game state.
   *
   * @param s - The current game state.
   * @returns The updated game state after applying the reset action.
   */
  apply(s: State):State {
    if (s.gameEnd) {
      // add one to gameTime for the sake of changing hash value
      return randomBlock.createInitialState(s.gameTime + 1)
    }
    return s
  }
}


/**
 * This class represents an action that performs a hard drop for the active tetromino.
 * A hard drop involves instantly moving the active tetromino to its lowest possible position within the game grid.
 */
class HardDrop implements Action {
  constructor() {};

  /**
   * Applies the hard drop action to the current game state.
   *
   * @param s - The current game state.
   * @returns The updated game state after performing the hard drop action.
   */
  apply(s: State):State {
    if (!s.gameEnd) {
      const activeTetromino = s.tetrominos.find((tetromino) => tetromino.id == s.activeTetrominoId)
      if (activeTetromino) {
        const activeHight = activeTetromino.shape.reduce((maxY, crr) => Math.max(maxY, crr.y), 0) + 1
        const activeWidth = activeTetromino.shape.reduce((maxX, crr) => Math.max(maxX, crr.x), 0) + 1
        const stackedTetrominos = s.tetrominos.filter((tetromino) => tetromino.id != s.activeTetrominoId)
        const allTetrominos = stackedTetrominos.concat(activeTetromino)
        // Base case
        // Check if the hard drop is possible.
        if (stackedActiveTetrominos(activeTetromino, activeHight) || stackedOnTetrominos(stackedTetrominos, activeTetromino, 0, 1)) {
          return s
        } else {
          return this.apply({...s, 
            // Perform the hard drop by moving the tetromino down until it collides.
            tetrominos: [...stackedTetrominos, {...activeTetromino, position: {x: activeTetromino.position.x, y: activeTetromino.position.y + 1}}]}
          )
        }
        }
    }
    return s
  }
}

/**
 * This function applies an action to the game state to update it.
 *
 * @param s - The current game state.
 * @param action - The action to apply to the game state.
 * @returns The updated game state after applying the action.
 */
const reduceState = (s: State, action: Action) => action.apply(s);