export { initialState, reduceState, Tick, Movement}
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

class Movement implements Action {
    constructor(public readonly x: number, public readonly y: number) {}
    apply(s: State): State {
        return {...s, position: {x: s.position.x + this.x, y: s.position.y + this.y}}
    }
}

const reduceState = (s: State, action: Action) => action.apply(s);