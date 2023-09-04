import { Tetromino, State } from "./type";

export {RNG, RandomBlock}

abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;
  
    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;
  
    /**
     * Takes hash value and scales it to the range [-1, 1]
     */
    public static scale = (hash: number, range: number) => (range * hash) / (RNG.m - 1);
}



class RandomBlock {
    blocks: Array<Array<{ x: number; y: number }>>
    colors: Array<String>
    obsBlocks: Array<Array<{ x: number; y: number }>>
    constructor() {
        this.blocks = [
            [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y:1}], 
            [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}],
            [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 0}, {x: 2, y: 1}],
            [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}],
            [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 0}],
            [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}]
        ]
        this.colors = ["blue", "orange", "yellow", "green", "purple", "red"]
        this.obsBlocks = [
            [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 10, y: 0}],
            [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x:5, y: 0},{x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}],
        ]
    }

    /**
     * createRandomBlock
     */
    public createRandomBlock(id: number, seed: number): Tetromino {
        const randomBlockNum = Math.abs(Math.floor((RNG.scale(RNG.hash(seed), this.blocks.length - 1))))
        const randomColorNum = Math.abs(Math.floor((RNG.scale(RNG.hash(seed), this.colors.length - 1))))

        return {
            id: id,
            shape: this.blocks[randomBlockNum],
            color: this.colors[randomColorNum],
            position: {x: 4, y: 0},
        }
    } 

    public createInitialState(gameTime: number): State {
        const initialState: State = {
            gameEnd: false,
            tetrominos: [this.createRandomBlock(1, 157 + gameTime)],
            activeTetrominoId: 1,
            previewTetromino:  this.createRandomBlock(2, 133 + gameTime),
            previewTetrominoId: 2,
            currentScore: 0,
            highScore: 0,
            gameTime: gameTime,
            hashVal: 133 + gameTime,
            level: 1,
            levelRows: 0
        } as const;
        return initialState
    }

    public randomObsShape(id: number, seed: number, yPos: number): Tetromino {
        const randomObsShape = Math.abs(Math.floor((RNG.scale(RNG.hash(seed), this.obsBlocks.length - 1))))

        return {
            id: id,
            shape: this.obsBlocks[randomObsShape],
            color: "grey",
            position: {x: 0, y: yPos},
        }
    } 
}