class TicTacToe {
    constructor() {
        this.board = Array(9).fill("");
        this.currentPlayer = "X";
        this.gameActive = true;
        this.statusDisplay = document.getElementById("status");
        this.cells = document.querySelectorAll("[data-cell]");
        this.restartButton = document.getElementById("restartButton");
        this.replayButton = document.getElementById("replayButton");
        this.exitButton = document.getElementById("exitButton");
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // Rows
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // Columns
            [0, 4, 8],
            [2, 4, 6], // Diagonals
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.cells.forEach((cell) => {
            cell.addEventListener("click", () => this.handleCellClick(cell));
        });
        this.restartButton.addEventListener("click", () => this.restartGame());
        this.replayButton.addEventListener("click", () => this.replayGame());
        this.exitButton.addEventListener("click", () => this.exitGame());
        this.updateStatus();
    }

    handleCellClick(cell) {
        const cellIndex = Array.from(this.cells).indexOf(cell);

        if (this.board[cellIndex] !== "" || !this.gameActive) return;

        this.updateCell(cell, cellIndex);
        this.checkResult();
    }

    updateCell(cell, index) {
        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
    }

    checkResult() {
        let roundWon = false;

        for (const condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (
                this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]
            ) {
                roundWon = true;
                this.highlightWinningCells(condition);
                break;
            }
        }

        if (roundWon) {
            this.statusDisplay.textContent = `Player ${this.currentPlayer} has won!`;
            this.gameActive = false;
            return;
        }

        if (!this.board.includes("")) {
            this.statusDisplay.textContent = "Game ended in a draw!";
            this.gameActive = false;
            return;
        }

        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        this.updateStatus();
    }

    highlightWinningCells(winningCombination) {
        winningCombination.forEach((index) => {
            this.cells[index].classList.add("winning");
        });
    }

    updateStatus() {
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
    }

    restartGame() {
        this.board = Array(9).fill("");
        this.currentPlayer = "X";
        this.gameActive = true;
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("x", "o", "winning");
        });
    }

    replayGame() {
        // Replay is the same as restart for this game
        this.restartGame();
    }

    exitGame() {
        // Clear the board and show exit message
        this.gameActive = false;
        this.statusDisplay.textContent = "Thanks for playing!";
        this.cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("x", "o", "winning");
        });
        this.board = Array(9).fill("");
    }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new TicTacToe();
});
