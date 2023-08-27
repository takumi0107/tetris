import { State, Viewport, Constants, Block } from './type'
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
    elem.parentNode!.appendChild(elem);
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
    console.log('test')
    svg.innerHTML = ''

    const squareDetails = [
      { x: 0, y: 0, color: "green" },
      { x: 1, y: 0, color: "green" },
      { x: 0, y: 1, color: "green" },
      { x: 1, y: 1, color: "green" },
    ];

    const square = squareDetails.map((squareDetail) => {
      const cube = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${(squareDetail.x + s.position.x) * Block.WIDTH}`,
        y: `${(squareDetail.y + s.position.y) * Block.HEIGHT}`,
        style: `fill: ${squareDetail.color}`,
      });
      svg.appendChild(cube);
      return cube;
    });

    // Add blocks to the main grid canvas
    // const cube = createSvgElement(svg.namespaceURI, "rect", {
    //   height: `${Block.HEIGHT}`,
    //   width: `${Block.WIDTH}`,
    //   x: "0",
    //   y: "0",
    //   style: "fill: green",
    // });
    // svg.appendChild(cube);

    // Add a block to the preview canvas
    const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * 2}`,
      y: `${Block.HEIGHT}`,
      style: "fill: green",
    });
    preview.appendChild(cubePreview);
};