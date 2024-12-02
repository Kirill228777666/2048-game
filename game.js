class Game2048 {
    constructor(boardSize = 4) {
        this.boardSize = boardSize;
        this.board = [];
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.newGameButton = document.getElementById('new-game');

        this.initializeEventListeners();
        this.setupBoard();
    }

    initializeEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.move('up'); break;
                case 'ArrowDown': this.move('down'); break;
                case 'ArrowLeft': this.move('left'); break;
                case 'ArrowRight': this.move('right'); break;
            }
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                this.move(diffX > 0 ? 'right' : 'left');
            } else {
                // Vertical swipe
                this.move(diffY > 0 ? 'down' : 'up');
            }
        });

        // New game button
        this.newGameButton.addEventListener('click', () => this.setupBoard());
    }

    setupBoard() {
        // Reset board and score
        this.board = Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill(0)
        );
        this.score = 0;
        this.scoreDisplay.textContent = this.score;

        // Clear previous board
        this.gameBoard.innerHTML = '';

        // Create grid cells
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tile');
            this.gameBoard.appendChild(cell);
        }

        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        this.renderBoard();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) {
                    emptyCells.push({r, c});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    renderBoard() {
        const tiles = this.gameBoard.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            const r = Math.floor(index / this.boardSize);
            const c = index % this.boardSize;
            const value = this.board[r][c];

            tile.textContent = value || '';
            tile.className = 'tile'; // Reset classes
            
            if (value) {
                tile.classList.add(`tile-${value}`);
                tile.classList.add('tile-new');
            }
        });
    }

    move(direction) {
        let moved = false;
        const rotatedBoard = this.rotateBoard(direction);

        for (let r = 0; r < this.boardSize; r++) {
            const row = rotatedBoard[r].filter(val => val !== 0);
            
            // Merge tiles
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    this.score += row[c];
                    row.splice(c + 1, 1);
                }
            }

            // Pad with zeros
            while (row.length < this.boardSize) {
                row.push(0);
            }

            // Check if board changed
            for (let c = 0; c < this.boardSize; c++) {
                if (rotatedBoard[r][c] !== row[c]) {
                    moved = true;
                }
                rotatedBoard[r][c] = row[c];
            }
        }

        // Rotate board back
        this.board = this.unrotateBoard(rotatedBoard, direction);

        if (moved) {
            this.addRandomTile();
            this.renderBoard();
            this.scoreDisplay.textContent = this.score;
            this.checkGameOver();
        }
    }

    rotateBoard(direction) {
        let rotated = JSON.parse(JSON.stringify(this.board));
        
        switch(direction) {
            case 'left':
                return rotated;
            case 'right':
                return rotated.map(row => row.reverse());
            case 'up':
                return rotated[0].map((_, colIndex) => 
                    rotated.map(row => row[colIndex]).reverse()
                );
            case 'down':
                return rotated[0].map((_, colIndex) => 
                    rotated.map(row => row[colIndex])
                );
        }
    }

    unrotateBoard(board, direction) {
        switch(direction) {
            case 'left':
                return board;
            case 'right':
                return board.map(row => row.reverse());
            case 'up':
                return board[0].map((_, colIndex) => 
                    board.map(row => row[colIndex]).reverse()
                );
            case 'down':
                return board[0].map((_, colIndex) => 
                    board.map(row => row[colIndex])
                );
        }
    }

    checkGameOver() {
        // Check if there are any empty cells
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === 0) return;
            }
        }

        // Check if any adjacent cells can be merged
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (
                    (r > 0 && this.board[r][c] === this.board[r-1][c]) ||
                    (r < this.boardSize-1 && this.board[r][c] === this.board[r+1][c]) ||
                    (c > 0 && this.board[r][c] === this.board[r][c-1]) ||
                    (c < this.boardSize-1 && this.board[r][c] === this.board[r][c+1])
                ) {
                    return;
                }
            }
        }

        // If we get here, game is over
        alert(`Game Over! Your score: ${this.score}`);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
