import React, { useState, useEffect, useCallback } from "react";
import "./Game.css";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 200; // milliseconds
const POWER_PELLET_DURATION = 5000; // 5 seconds

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type CellType = "EMPTY" | "WALL" | "DOT" | "POWER_PELLET" | "PACMAN" | "GHOST";
type GhostState = "NORMAL" | "VULNERABLE" | "EYES";

interface Position {
    x: number;
    y: number;
}

interface Ghost {
    position: Position;
    state: GhostState;
    color: string;
    personality: "CHASE" | "SCATTER" | "AMBUSH";
}

interface GameState {
    board: CellType[][];
    pacman: Position;
    ghosts: Ghost[];
    direction: Direction;
    score: number;
    gameOver: boolean;
    powerPelletActive: boolean;
    remainingDots: number;
}

const initialGameState: GameState = {
    board: Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill("EMPTY")),
    pacman: { x: 10, y: 15 },
    ghosts: [
        {
            position: { x: 9, y: 9 },
            state: "NORMAL",
            color: "#FF0000",
            personality: "CHASE",
        },
        {
            position: { x: 10, y: 9 },
            state: "NORMAL",
            color: "#FFB8FF",
            personality: "SCATTER",
        },
        {
            position: { x: 11, y: 9 },
            state: "NORMAL",
            color: "#00FFFF",
            personality: "AMBUSH",
        },
    ],
    direction: "RIGHT",
    score: 0,
    gameOver: false,
    powerPelletActive: false,
    remainingDots: 0,
};

export const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);

    useEffect(() => {
        initializeGame();
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    useEffect(() => {
        const gameInterval = setInterval(updateGame, GAME_SPEED);
        return () => clearInterval(gameInterval);
    }, [gameState.direction]);

    const initializeGame = () => {
        const newBoard = Array(GRID_SIZE)
            .fill(null)
            .map(() => Array(GRID_SIZE).fill("EMPTY"));

        // Create walls with a more interesting pattern
        for (let i = 0; i < GRID_SIZE; i++) {
            newBoard[0][i] = "WALL";
            newBoard[GRID_SIZE - 1][i] = "WALL";
            newBoard[i][0] = "WALL";
            newBoard[i][GRID_SIZE - 1] = "WALL";
        }

        // Add some internal walls
        for (let i = 5; i < 15; i++) {
            newBoard[5][i] = "WALL";
            newBoard[15][i] = "WALL";
        }
        for (let i = 5; i < 15; i++) {
            newBoard[i][5] = "WALL";
            newBoard[i][15] = "WALL";
        }

        // Create dots and power pellets
        let dotCount = 0;
        for (let i = 2; i < GRID_SIZE - 2; i++) {
            for (let j = 2; j < GRID_SIZE - 2; j++) {
                if (newBoard[i][j] === "EMPTY") {
                    if (
                        (i === 2 && j === 2) ||
                        (i === 2 && j === GRID_SIZE - 3) ||
                        (i === GRID_SIZE - 3 && j === 2) ||
                        (i === GRID_SIZE - 3 && j === GRID_SIZE - 3)
                    ) {
                        newBoard[i][j] = "POWER_PELLET";
                    } else {
                        newBoard[i][j] = "DOT";
                        dotCount++;
                    }
                }
            }
        }

        // Place Pacman and ghosts
        newBoard[gameState.pacman.y][gameState.pacman.x] = "PACMAN";
        gameState.ghosts.forEach((ghost) => {
            newBoard[ghost.position.y][ghost.position.x] = "GHOST";
        });

        setGameState((prev) => ({
            ...prev,
            board: newBoard,
            remainingDots: dotCount,
        }));
    };

    const handleKeyPress = useCallback(
        (e: KeyboardEvent) => {
            let newDirection: Direction = gameState.direction;

            switch (e.key) {
                case "ArrowUp":
                    newDirection = "UP";
                    break;
                case "ArrowDown":
                    newDirection = "DOWN";
                    break;
                case "ArrowLeft":
                    newDirection = "LEFT";
                    break;
                case "ArrowRight":
                    newDirection = "RIGHT";
                    break;
            }

            setGameState((prev) => ({ ...prev, direction: newDirection }));
        },
        [gameState.direction]
    );

    const updateGame = () => {
        if (gameState.gameOver) return;

        const newBoard = [...gameState.board.map((row) => [...row])];
        const newPacman = { ...gameState.pacman };
        const newGhosts = gameState.ghosts.map((ghost) => ({ ...ghost }));

        // Move Pacman
        const nextPacmanPos = getNextPosition(newPacman, gameState.direction);
        if (isValidMove(nextPacmanPos, newBoard)) {
            newBoard[newPacman.y][newPacman.x] = "EMPTY";
            newPacman.x = nextPacmanPos.x;
            newPacman.y = nextPacmanPos.y;

            // Check for dots and power pellets
            if (newBoard[newPacman.y][newPacman.x] === "DOT") {
                setGameState((prev) => ({
                    ...prev,
                    score: prev.score + 10,
                    remainingDots: prev.remainingDots - 1,
                }));
            } else if (newBoard[newPacman.y][newPacman.x] === "POWER_PELLET") {
                setGameState((prev) => ({
                    ...prev,
                    score: prev.score + 50,
                    powerPelletActive: true,
                }));
                // Make ghosts vulnerable
                newGhosts.forEach((ghost) => {
                    ghost.state = "VULNERABLE";
                });
                // Reset power pellet after duration
                setTimeout(() => {
                    setGameState((prev) => ({
                        ...prev,
                        powerPelletActive: false,
                        ghosts: prev.ghosts.map((ghost) => ({
                            ...ghost,
                            state: "NORMAL",
                        })),
                    }));
                }, POWER_PELLET_DURATION);
            }

            newBoard[newPacman.y][newPacman.x] = "PACMAN";
        }

        // Move ghosts
        newGhosts.forEach((ghost) => {
            newBoard[ghost.position.y][ghost.position.x] = "EMPTY";
            const nextGhostPos = getNextGhostPosition(ghost, newPacman);
            ghost.position.x = nextGhostPos.x;
            ghost.position.y = nextGhostPos.y;
            newBoard[ghost.position.y][ghost.position.x] = "GHOST";

            // Check for collision with Pacman
            if (
                ghost.position.x === newPacman.x &&
                ghost.position.y === newPacman.y
            ) {
                if (ghost.state === "VULNERABLE") {
                    // Ghost is eaten
                    ghost.state = "EYES";
                    setGameState((prev) => ({
                        ...prev,
                        score: prev.score + 200,
                    }));
                } else if (ghost.state !== "EYES") {
                    setGameState((prev) => ({ ...prev, gameOver: true }));
                }
            }
        });

        // Check win condition
        if (gameState.remainingDots === 0) {
            setGameState((prev) => ({ ...prev, gameOver: true }));
        }

        setGameState((prev) => ({
            ...prev,
            board: newBoard,
            pacman: newPacman,
            ghosts: newGhosts,
        }));
    };

    const getNextPosition = (pos: Position, direction: Direction): Position => {
        const nextPos = { ...pos };
        switch (direction) {
            case "UP":
                nextPos.y--;
                break;
            case "DOWN":
                nextPos.y++;
                break;
            case "LEFT":
                nextPos.x--;
                break;
            case "RIGHT":
                nextPos.x++;
                break;
        }
        return nextPos;
    };

    const getNextGhostPosition = (ghost: Ghost, pacman: Position): Position => {
        const possibleMoves: Position[] = [
            { x: ghost.position.x, y: ghost.position.y - 1 },
            { x: ghost.position.x, y: ghost.position.y + 1 },
            { x: ghost.position.x - 1, y: ghost.position.y },
            { x: ghost.position.x + 1, y: ghost.position.y },
        ];

        const validMoves = possibleMoves.filter(
            (pos) =>
                pos.x >= 0 &&
                pos.x < GRID_SIZE &&
                pos.y >= 0 &&
                pos.y < GRID_SIZE &&
                gameState.board[pos.y][pos.x] !== "WALL"
        );

        if (validMoves.length === 0) return ghost.position;

        if (ghost.state === "VULNERABLE") {
            // Run away from Pacman
            const distances = validMoves.map(
                (pos) => Math.abs(pos.x - pacman.x) + Math.abs(pos.y - pacman.y)
            );
            const maxDistance = Math.max(...distances);
            const bestMoves = validMoves.filter(
                (_, i) => distances[i] === maxDistance
            );
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        } else if (ghost.state === "EYES") {
            // Return to ghost house
            const ghostHouse = { x: 10, y: 9 };
            const distances = validMoves.map(
                (pos) =>
                    Math.abs(pos.x - ghostHouse.x) +
                    Math.abs(pos.y - ghostHouse.y)
            );
            const minDistance = Math.min(...distances);
            const bestMoves = validMoves.filter(
                (_, i) => distances[i] === minDistance
            );
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        } else {
            // Different behaviors based on personality
            switch (ghost.personality) {
                case "CHASE":
                    // Directly chase Pacman
                    const distances = validMoves.map(
                        (pos) =>
                            Math.abs(pos.x - pacman.x) +
                            Math.abs(pos.y - pacman.y)
                    );
                    const minDistance = Math.min(...distances);
                    const bestMoves = validMoves.filter(
                        (_, i) => distances[i] === minDistance
                    );
                    return bestMoves[
                        Math.floor(Math.random() * bestMoves.length)
                    ];
                case "SCATTER":
                    // Move to corners
                    const corners = [
                        { x: 2, y: 2 },
                        { x: GRID_SIZE - 3, y: 2 },
                        { x: 2, y: GRID_SIZE - 3 },
                        { x: GRID_SIZE - 3, y: GRID_SIZE - 3 },
                    ];
                    const cornerDistances = validMoves.map((pos) =>
                        Math.min(
                            ...corners.map(
                                (corner) =>
                                    Math.abs(pos.x - corner.x) +
                                    Math.abs(pos.y - corner.y)
                            )
                        )
                    );
                    const minCornerDistance = Math.min(...cornerDistances);
                    const bestCornerMoves = validMoves.filter(
                        (_, i) => cornerDistances[i] === minCornerDistance
                    );
                    return bestCornerMoves[
                        Math.floor(Math.random() * bestCornerMoves.length)
                    ];
                case "AMBUSH":
                    // Try to predict Pacman's path
                    const predictedPos = {
                        x:
                            pacman.x +
                            (gameState.direction === "LEFT"
                                ? -2
                                : gameState.direction === "RIGHT"
                                ? 2
                                : 0),
                        y:
                            pacman.y +
                            (gameState.direction === "UP"
                                ? -2
                                : gameState.direction === "DOWN"
                                ? 2
                                : 0),
                    };
                    const ambushDistances = validMoves.map(
                        (pos) =>
                            Math.abs(pos.x - predictedPos.x) +
                            Math.abs(pos.y - predictedPos.y)
                    );
                    const minAmbushDistance = Math.min(...ambushDistances);
                    const bestAmbushMoves = validMoves.filter(
                        (_, i) => ambushDistances[i] === minAmbushDistance
                    );
                    return bestAmbushMoves[
                        Math.floor(Math.random() * bestAmbushMoves.length)
                    ];
            }
        }
    };

    const isValidMove = (pos: Position, board: CellType[][]): boolean => {
        return (
            pos.x >= 0 &&
            pos.x < GRID_SIZE &&
            pos.y >= 0 &&
            pos.y < GRID_SIZE &&
            board[pos.y][pos.x] !== "WALL"
        );
    };

    const getCellClass = (cellType: CellType, ghost?: Ghost): string => {
        switch (cellType) {
            case "WALL":
                return "cell wall";
            case "DOT":
                return "cell dot";
            case "POWER_PELLET":
                return "cell power-pellet";
            case "PACMAN":
                return `cell pacman ${gameState.direction.toLowerCase()}`;
            case "GHOST":
                return `cell ghost ${ghost?.state.toLowerCase()}`;
            default:
                return "cell";
        }
    };

    return (
        <div className="game-container">
            <div className="score">Score: {gameState.score}</div>
            <div
                className="game-board"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    width: `${GRID_SIZE * CELL_SIZE}px`,
                    height: `${GRID_SIZE * CELL_SIZE}px`,
                }}
            >
                {gameState.board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const ghost = gameState.ghosts.find(
                            (g) =>
                                g.position.x === colIndex &&
                                g.position.y === rowIndex
                        );
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={getCellClass(cell, ghost)}
                                style={
                                    ghost
                                        ? { backgroundColor: ghost.color }
                                        : undefined
                                }
                            />
                        );
                    })
                )}
            </div>
            {gameState.gameOver && (
                <div className="game-over">
                    {gameState.remainingDots === 0 ? "You Win!" : "Game Over!"}
                    <div>Final Score: {gameState.score}</div>
                    <button
                        onClick={() => setGameState(initialGameState)}
                        className="play-again-button"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default Game;
