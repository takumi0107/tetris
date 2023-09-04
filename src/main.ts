

import "./style.css";

import { fromEvent, interval, merge, Observable, Subscription } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { Tick, initialState, reduceState, Movement, Rotation, Reset} from './state';
import {Viewport, Constants, Block, Key, Event, State, Action} from './type'
import {render, gameover, show, hide} from './view'

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

  /** User input */

  // Create an observable for keyboard events.
  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  // Define observables for key events.
  const fromKey = (keyCode: Key) =>
    key$.pipe(filter(({ code }) => code === keyCode));

  // Observables for movement and rotation by key.
  const left$ = fromKey("KeyA").pipe(map(_ => new Movement(-1, 0)));
  const right$ = fromKey("KeyD").pipe(map(_ => new Movement(1, 0)));
  const down$ = fromKey("KeyS").pipe(map(_ => new Movement(0, 1)));
  const rotation$ = fromKey("KeyW").pipe(map(_ => new Rotation()));
  const reset$ = fromKey("KeyR").pipe(map(_ => new Reset()))

  const movement$ = merge(left$, right$, down$)

   /** Determines the rate of time steps */
   const tick$ = interval(Constants.TICK_RATE_MS).pipe(map(elapsed => new Tick()))

  /** Observables */

  // Create an observable by mergig game events.
  const event$ : Observable<Action> = merge(tick$, movement$, rotation$, reset$)
  //process game events.
  const state$ : Observable<State> = event$.pipe(scan(reduceState, initialState))
  // Subscribe to the state observable to render the game visuals.
  const subscription: Subscription = state$.subscribe(render)
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
