/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge, Observable, Subscription } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { Tick, initialState, reduceState, Movement} from './state';
import {Viewport, Constants, Block, Key, Event, State, Action} from './type'
import {render, gameover, show, hide} from './view'

/** Utility functions */
/**
 * state transducer
 * @param s input State
 * @param action type of action to apply to the State
 * @returns a new State 
 */

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => {
  if (!s.gameEnd) {
    const newPosition = {
      x: s.position.x,
      y: s.position.y + 1,
    };
    return {...s, position: newPosition}
  }
  return s
};



/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key) =>
    key$.pipe(filter(({ code }) => code === keyCode));

  const left$ = fromKey("KeyA").pipe(map(_ => new Movement(-1, 0)));
  const right$ = fromKey("KeyD").pipe(map(_ => new Movement(1, 0)));
  const down$ = fromKey("KeyS").pipe(map(_ => new Movement(0, 1)));

  const movement$ = merge(left$, right$, down$)

   /** Determines the rate of time steps */
   const tick$ = interval(Constants.TICK_RATE_MS).pipe(map(elapsed => new Tick()))

  /** Observables */
  const event$ : Observable<Action> = merge(tick$, movement$)
  const state$ : Observable<State> = event$.pipe(scan(reduceState, initialState))
  const subscription: Subscription = state$.subscribe(render)

  // const source$ = merge(tick$)
  //   .pipe(scan((s: State) => tick(s), initialState))
  //   .subscribe((s: State) => {
  //     render(s);
      
  //     if (s.gameEnd) {
  //       show(gameover);
  //     } else {
  //       hide(gameover);
  //     }
  //   });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
