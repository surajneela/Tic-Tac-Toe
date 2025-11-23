class TicTacToe {
    constructor() {
        this.board = Array(9).fill("");
        this.currentPlayer = "X";
        this.gameActive = false;
        this.scoreX = 0;
        this.scoreO = 0;
        this.totalGames = 3;
        this.currentGame = 0;
        this.statusDisplay = document.getElementById("status");
        this.cells = document.querySelectorAll("[data-cell]");
        this.restartButton = document.getElementById("restartButton");
        this.nextGameButton = document.getElementById("nextGameButton");
        this.exitButton = document.getElementById("exitButton");
        this.scoreXDisplay = document.getElementById("scoreX");
        this.scoreODisplay = document.getElementById("scoreO");
        this.gameProgressDisplay = document.getElementById("gameProgress");
        this.setupModal = document.getElementById("setupModal");
        this.startGameButton = document.getElementById("startGameButton");
        this.numGamesInput = document.getElementById("numGames");
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
        this.nextGameButton.addEventListener("click", () => this.nextGame());
        this.exitButton.addEventListener("click", () => this.exitGame());
        this.startGameButton.addEventListener("click", () => this.startTournament());
        this.showSetupModal();
        this.updateStatus();
    }

    showSetupModal() {
        this.setupModal.style.display = 'flex';
    }

    hideSetupModal() {
        this.setupModal.style.display = 'none';
    }

    startTournament() {
        this.totalGames = parseInt(this.numGamesInput.value) || 3;
        this.currentGame = 1;
        this.scoreX = 0;
        this.scoreO = 0;
        this.gameActive = true;
        this.nextGameButton.style.display = 'none';
        this.updateScoreDisplay();
        this.updateGameProgress();
        this.hideSetupModal();
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

            // Check if player has won more than 50% of games
            const gamesNeededToWin = Math.ceil(this.totalGames / 2);
            const currentPlayerScore = this.currentPlayer === "X" ? this.scoreX : this.scoreO;

            if (currentPlayerScore >= gamesNeededToWin) {
                // Player has secured tournament victory
                this.showGraffitiCelebration();
            }

            this.showNextGameButton();
            return;
        }

        if (!this.board.includes("")) {
            this.statusDisplay.textContent = "Game ended in a draw!";
            this.gameActive = false;
            this.showNextGameButton();
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
        this.gameActive = false;
        this.scoreX = 0;
        this.scoreO = 0;
        this.currentGame = 0;
        this.nextGameButton.style.display = 'none';
        this.updateScoreDisplay();
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("x", "o", "winning");
        });
        this.removeGraffitiCelebration();
        const tournamentResults = document.getElementById('tournament-results');
        if (tournamentResults) {
            tournamentResults.remove();
        }
        this.showSetupModal();
    }

    nextGame() {
        // Move to next game in tournament
        if (this.currentGame < this.totalGames) {
            this.currentGame++;
            this.board = Array(9).fill("");
            this.currentPlayer = "X";
            this.gameActive = true;
            this.nextGameButton.style.display = 'none';
            this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
            this.cells.forEach((cell) => {
                cell.textContent = "";
                cell.classList.remove("x", "o", "winning");
            });
            this.removeGraffitiCelebration();
            this.updateGameProgress();
        } else {
            this.showTournamentResults();
        }
    }

    showNextGameButton() {
        const gamesNeededToWin = Math.ceil(this.totalGames / 2);

        // Check if someone has already won the tournament
        if (this.scoreX >= gamesNeededToWin || this.scoreO >= gamesNeededToWin) {
            // Tournament is over, show results after delay
            setTimeout(() => {
                this.showTournamentResults();
            }, 3000);
        } else if (this.currentGame < this.totalGames) {
            // More games to play
            this.nextGameButton.style.display = 'inline-block';
        } else {
            // All games played, show tournament results
            setTimeout(() => {
                this.showTournamentResults();
            }, 3000);
        }
    }

    exitGame() {
        // Clear the board and show exit message
        this.gameActive = false;
        this.scoreX = 0;
        this.scoreO = 0;
        this.currentGame = 0;
        this.nextGameButton.style.display = 'none';
        this.updateScoreDisplay();
        this.statusDisplay.textContent = "Thanks for playing!";
        this.cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("x", "o", "winning");
        });
        this.board = Array(9).fill("");
        this.removeGraffitiCelebration();
        this.showSetupModal();
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

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 500); // Wait for fade-out animation
        }, 3000);
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

    updateGameProgress() {
        this.gameProgressDisplay.textContent = `Game ${this.currentGame} of ${this.totalGames}`;
    }

    checkTournamentEnd() {
        if (this.currentGame >= this.totalGames) {
            setTimeout(() => {
                this.showTournamentResults();
            }, 3000);
        }
    }

    showTournamentResults() {
        this.removeGraffitiCelebration();
        const overlay = document.createElement('div');
        overlay.id = 'tournament-results';
        overlay.className = 'graffiti-celebration show';

        const resultsText = document.createElement('div');
        resultsText.className = 'graffiti-text';

        if (this.scoreX > this.scoreO) {
            resultsText.textContent = `🏆 PLAYER X WINS! 🏆`;
        } else if (this.scoreO > this.scoreX) {
            resultsText.textContent = `🏆 PLAYER O WINS! 🏆`;
        } else {
            resultsText.textContent = `🤝 IT'S A TIE! 🤝`;
        }

        const scoreText = document.createElement('div');
        scoreText.className = 'tournament-score';
        scoreText.textContent = `Final Score: X ${this.scoreX} - ${this.scoreO} O`;

        const restartPrompt = document.createElement('div');
        restartPrompt.className = 'tournament-prompt';
        restartPrompt.textContent = 'Click Restart to play again!';

        overlay.appendChild(resultsText);
        overlay.appendChild(scoreText);
        overlay.appendChild(restartPrompt);
        document.body.appendChild(overlay);

        this.createConfetti(overlay);
    }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new TicTacToe();
});
