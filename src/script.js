class TicTacToe {
    constructor() {
        this.board = Array(9).fill("");
        this.currentPlayer = "X";
        this.gameActive = true;
        this.scoreX = 0;
        this.scoreO = 0;
        this.statusDisplay = document.getElementById("status");
        this.cells = document.querySelectorAll("[data-cell]");
        this.restartButton = document.getElementById("restartButton");
        this.replayButton = document.getElementById("replayButton");
        this.exitButton = document.getElementById("exitButton");
        this.scoreXDisplay = document.getElementById("scoreX");
        this.scoreODisplay = document.getElementById("scoreO");
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
            this.updateScore();
            this.showGraffitiCelebration();
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
        this.scoreX = 0;
        this.scoreO = 0;
        this.updateScoreDisplay();
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("x", "o", "winning");
        });
        this.removeGraffitiCelebration();
    }

    replayGame() {
        // Replay is the same as restart for this game
        this.restartGame();
    }

    exitGame() {
        // Clear the board and show exit message
        this.gameActive = false;
        this.scoreX = 0;
        this.scoreO = 0;
        this.updateScoreDisplay();
        this.statusDisplay.textContent = "Thanks for playing!";
        this.cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("x", "o", "winning");
        });
        this.board = Array(9).fill("");
        this.removeGraffitiCelebration();
    }

    showGraffitiCelebration() {
        // Create graffiti overlay
        const overlay = document.createElement('div');
        overlay.id = 'graffiti-overlay';
        overlay.className = 'graffiti-celebration';

        // Create winner text with graffiti style
        const winnerText = document.createElement('div');
        winnerText.className = 'graffiti-text';
        winnerText.textContent = `${this.currentPlayer} WINS!`;

        overlay.appendChild(winnerText);
        document.body.appendChild(overlay);

        // Add confetti effect
        this.createConfetti(overlay);

        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }

    removeGraffitiCelebration() {
        const overlay = document.getElementById('graffiti-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    createConfetti(container) {
        const colors = ['#00b894', '#0984e3', '#e84393', '#fdcb6e', '#ff7675', '#74b9ff'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(confetti);
        }
    }

    updateScore() {
        if (this.currentPlayer === "X") {
            this.scoreX++;
        } else {
            this.scoreO++;
        }
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.scoreXDisplay.textContent = this.scoreX;
        this.scoreODisplay.textContent = this.scoreO;
    }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new TicTacToe();
});
