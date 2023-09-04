import "./style.css";
import { State, Viewport, Constants, Block, Tetromino } from './type'
export {render, gameover, show, hide}
/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {}
) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

// Canvas elements
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
HTMLElement;
const container = document.querySelector("#main") as HTMLElement;

svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

// Text fields
const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);;
};
  
  /**
   * Hides a SVG element on the canvas.
   * @param elem SVG element to hide
   */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");

/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
const render = (s: State) => {
    // Remove all children from the SVG element except for the 'gameover' element.
    const childrenToRemove = Array.from(svg.children).filter(child => child != gameover);
    childrenToRemove.forEach(child => svg.removeChild(child));
    // Clear the Tetromino preview element.
    preview.innerHTML = ''

    // Update the displayed score, high score, and level.
    scoreText.textContent = s.currentScore.toString()
    highScoreText.textContent = s.highScore.toString()
    levelText.textContent = s.level.toString()

    // Render Tetrominos on the game board.
    s.tetrominos.forEach(tetromino=> {
      tetromino.shape.forEach((shape_pos) => {
          const cube = createSvgElement(svg.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${(shape_pos.x + tetromino.position.x) * Block.WIDTH}`,
            y: `${(shape_pos.y + tetromino.position.y) * Block.HEIGHT}`,
            style: `fill: ${tetromino.color}`
          })
          svg.appendChild(cube);
      })
    })

    // Render Tetrominos on the preview.
    s.previewTetromino.shape.forEach((shape_pos) => {
      const cubePreview = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${(shape_pos.x + 2) * Block.WIDTH}`,
        y: `${(shape_pos.y + 1) * Block.HEIGHT}`,
        style: `fill: ${s.previewTetromino.color}`
      })
      preview.appendChild(cubePreview);
    })
    
    if(s.gameEnd) {
      show(gameover)
    } else {
      hide(gameover)
    }
};