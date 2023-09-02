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
class Floor {
  private floorBlocks: Set<string>;
  constructor() {
    this.floorBlocks = new Set(); 
  }

  addBlock(x: number, y: number) {
    this.floorBlocks.add(`${x},${y}`);
  }

  isPartOfFloor(x: number, y: number) {
    return this.floorBlocks.has(`${x},${y}`);
  }
}
/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
const render = (s: State) => {
    // svg.innerHTML = ''
    const childrenToRemove = Array.from(svg.children).filter(child => child != gameover);
    childrenToRemove.forEach(child => svg.removeChild(child));

    scoreText.textContent = s.currentScore.toString()
    highScoreText.textContent = s.highScore.toString()
    s.tetrominos.forEach(tetromino=> {
      tetromino.shape.forEach((shape_pos) => {
          const cube = createSvgElement(svg.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${(shape_pos.x + tetromino.position.x) * Block.WIDTH}`,
            y: `${(shape_pos.y + tetromino.position.y) * Block.HEIGHT}`,
            style: "fill: green"
          })
          svg.appendChild(cube);
      })
    })

    s.previewTetromino.shape.forEach((shape_pos) => {
      const cubePreview = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${(shape_pos.x + s.previewTetromino.position.x + 2) * Block.WIDTH}`,
        y: `${(shape_pos.y + s.previewTetromino.position.y + 2) * Block.HEIGHT}`,
        style: "fill: green"
      })
      preview.appendChild(cubePreview);
    })
    // const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
    //   height: `${Block.HEIGHT}`,
    //   width: `${Block.WIDTH}`,
    //   x: `${(s.previewTetromino.shape.x + s.previewTetromino.position.x) * Block.WIDTH * 2}`,
    //   y: `${Block.HEIGHT}`,
    //   style: "fill: green",
    // });
    

    if(s.gameEnd) {
      show(gameover)
    } else {
      hide(gameover)
    }
};