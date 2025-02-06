let rows = 20, cols = 20, mines = 40;
let grid = [];
let gameOver = false;

function initControls() {
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    const minesInput = document.getElementById('mines');
    
    rowsInput.addEventListener('input', updateGridSize);
    colsInput.addEventListener('input', updateGridSize);
    minesInput.addEventListener('input', updateMines);
    
    function updateGridSize() {
        rows = +rowsInput.value;
        cols = +colsInput.value;
        document.getElementById('rowsValue').textContent = rows;
        document.getElementById('colsValue').textContent = cols;
        
        // 计算最大允许地雷数
        const maxMines = Math.min(rows * cols - 1, 100);
        minesInput.max = maxMines;
        
        // 如果当前地雷数超过新最大值，自动修正
        if (mines > maxMines) {
            mines = maxMines;
            minesInput.value = maxMines;
            document.getElementById('minesValue').textContent = maxMines;
        }
        newGame();
    }
    
    function updateMines() {
        mines = +minesInput.value;
        document.getElementById('minesValue').textContent = mines;
        newGame();
    }
    
    // 初始化时执行一次校验
    updateGridSize();
    updateMines();
}

function newGame() {
    gameOver = false;
    createGrid();
    placeMines();
}

function createGrid() {
    const game = document.getElementById('game');
    game.innerHTML = '';
    
    grid = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            neighborMines: 0
        }))
    );

    const gridElement = document.createElement('div');
    gridElement.className = 'grid';
    gridElement.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', handleLeftClick);
            cell.addEventListener('contextmenu', handleRightClick);
            
            gridElement.appendChild(cell);
        }
    }
    game.appendChild(gridElement);
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (!grid[row][col].isMine) {
            grid[row][col].isMine = true;
            minesPlaced++;
        }
    }
    calculateNeighbors();
}

function calculateNeighbors() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!grid[i][j].isMine) {
                grid[i][j].neighborMines = countNeighborMines(i, j);
            }
        }
    }
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && 
                newCol >= 0 && newCol < cols &&
                grid[newRow][newCol].isMine) {
                count++;
            }
        }
    }
    return count;
}

function handleLeftClick(e) {
    if (gameOver) return;
    const row = +e.target.dataset.row;
    const col = +e.target.dataset.col;
    
    if (grid[row][col].flagged) return;
    
    if (grid[row][col].isMine) {
        gameOver = true;
        revealAll();
        alert('游戏结束！');
        return;
    }
    
    reveal(row, col);
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const cell = e.target;
    const row = +cell.dataset.row;
    const col = +cell.dataset.col;
    
    if (!grid[row][col].revealed) {
        grid[row][col].flagged = !grid[row][col].flagged;
        cell.classList.toggle('flagged', grid[row][col].flagged);
    }
}

function reveal(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (grid[row][col].revealed || grid[row][col].flagged) return;
    
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    grid[row][col].revealed = true;
    cell.classList.add('revealed');
    
    if (grid[row][col].neighborMines > 0) {
        cell.textContent = grid[row][col].neighborMines;
    } else {
        // 自动展开周围空白区域
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                reveal(row + i, col + j);
            }
        }
    }
}

function revealAll() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            if (grid[i][j].isMine) {
                cell.classList.add('mine');
            }
        }
    }
}

// 初始化
initControls();
newGame(); 