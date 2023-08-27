export { initialState, reduceState, Tick}
import {State, Action} from "./type.ts" 


const initialState: State = {
    gameEnd: false,
    position: {x: 0, y: 0}
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
          const newPosition = {
            x: s.position.x,
            y: s.position.y + 1,
          };
          return {...s, position: newPosition}
        }
        return s
      }
  }

const reduceState = (s: State, action: Action) => action.apply(s);