document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const grid = document.getElementById('grid');
    const addShipButton = document.getElementById('add-ship');
    const addObstacleButton = document.getElementById('add-obstacle');
    const resetGameButton = document.getElementById('reset-game');
    const startGameButton = document.getElementById('start-game');
    const nextTurnButton = document.getElementById('next-turn');
    const downloadMovesButton = document.getElementById('download-moves');
    const downloadSaveButton = document.getElementById('download-save');
    const loadSaveButton = document.getElementById('load-save-button');
    const loadSaveInput = document.getElementById('load-save');
    const teamA = document.getElementById('team-a');
    const teamB = document.getElementById('team-b');
    const teamSelect = document.getElementById('team-select');
    const teamATitle = document.getElementById('team-a-title');
    const teamBTitle = document.getElementById('team-b-title');
    const shipOverview = document.getElementById('ship-overview');
    const turnIndicator = document.getElementById('turn-indicator');
    const winningBar = document.getElementById('winning-bar');
    const shipActionModal = document.getElementById('ship-action-modal');
    const shipStatsModal = document.getElementById('ship-stats-modal');
    const attackConfirmModal = document.getElementById('attack-confirm-modal');
    const endGameModal = document.getElementById('end-game-modal');
    const endGameSummary = document.getElementById('end-game-summary');
    const moveTracker = document.getElementById('move-tracker');
    const tooltip = document.getElementById('tooltip');
    const teamAColorInput = document.getElementById('team-a-color');
    const teamBColorInput = document.getElementById('team-b-color');
    const teamAJumpButton = document.getElementById('team-a-jump');
    const teamBJumpButton = document.getElementById('team-b-jump');
    const closeModalButtons = document.querySelectorAll('.close');
    const changeStatsButton = document.getElementById('change-stats');
    const placeOnMapButton = document.getElementById('place-on-map');
    const deleteShipButton = document.getElementById('delete-ship');
    const saveShipStatsButton = document.getElementById('save-ship-stats');
    const duplicateShipButton = document.getElementById('duplicate-ship');
    const confirmAttackButton = document.getElementById('confirm-attack');
    const cancelAttackButton = document.getElementById('cancel-attack');
    const closeEndGameButton = document.getElementById('close-end-game');
    const shipNameInput = document.getElementById('ship-name');
    const shipRangeInput = document.getElementById('ship-range');
    const shipHullInput = document.getElementById('ship-hull');
    const shipShieldsInput = document.getElementById('ship-shields');
    const shipGunPowerInput = document.getElementById('ship-gunpower');
    const obstacleModal = document.getElementById('obstacle-modal');
    const obstacleNameInput = document.getElementById('obstacle-name');
    const obstacleTypeSelect = document.getElementById('obstacle-type');
    const obstacleSizeInput = document.getElementById('obstacle-size');
    const sizeExample = document.getElementById('size-example');
    const obstacleColorInput = document.getElementById('obstacle-color');
    const placeObstacleButton = document.getElementById('place-obstacle');
    const importShipsInput = document.getElementById('import-ships');

    // Variables
    const gridSize = 50;
    const ships = [];
    const obstacles = [];
    let currentShip = null;
    let currentObstacle = null;
    let currentTurn = 0;
    let currentTeam = 'A';
    let gameStarted = false;
    let moveSteps = 0;
    let teamNames = { 'A': 'Team A', 'B': 'Team B' };

    // Initialize the grid
    createGrid();

    // Hide the "Next Turn" button initially
    nextTurnButton.style.display = 'none';

    // Event listeners for modal close buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Event listeners for team color inputs
    teamAColorInput.addEventListener('input', renderGrid);
    teamBColorInput.addEventListener('input', renderGrid);
    
    // Event listeners for team titles (for renaming)
    teamATitle.addEventListener('dblclick', () => renameTeam('A'));
    teamBTitle.addEventListener('dblclick', () => renameTeam('B'));
    
    // Event listeners for main buttons
    addShipButton.addEventListener('click', () => addShip(teamSelect.value));
    addObstacleButton.addEventListener('click', openObstacleModal);
    resetGameButton.addEventListener('click', resetGame);
    startGameButton.addEventListener('click', startGame);
    nextTurnButton.addEventListener('click', nextTurn);
    closeEndGameButton.addEventListener('click', () => endGameModal.style.display = 'none');
    changeStatsButton.addEventListener('click', editShipStats);
    placeOnMapButton.addEventListener('click', () => shipActionModal.style.display = 'none');
    deleteShipButton.addEventListener('click', deleteShip);
    saveShipStatsButton.addEventListener('click', saveShipStats);
    duplicateShipButton.addEventListener('click', duplicateShip);
    placeObstacleButton.addEventListener('click', createObstacle);
    obstacleSizeInput.addEventListener('input', updateSizeExample);
    obstacleColorInput.addEventListener('input', updateSizeExample);
    downloadMovesButton.addEventListener('click', downloadMoveRecord);
    downloadSaveButton.addEventListener('click', promptSaveGame);
    loadSaveButton.addEventListener('click', () => loadSaveInput.click());
    loadSaveInput.addEventListener('change', handleLoadGame);
    importShipsInput.addEventListener('change', handleImportShips);

    // Grid event listeners
    grid.addEventListener('click', handleGridClick);
    document.addEventListener('keydown', handleMove);

    // Functions

    function createGrid() {
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleGridClick(i));
            cell.addEventListener('mouseenter', showTooltip);
            cell.addEventListener('mouseleave', hideTooltip);
            grid.appendChild(cell);
        }
    }

    function addShip(team) {
        const ship = {
            id: ships.length,
            team,
            name: `Ship ${ships.length + 1}`,
            position: null,
            stats: {
                range: 1,
                hull: 100,
                shields: 50,
                gunPower: 10
            },
            moved: false,
            actionTaken: false,
            initialPosition: null,
            damageDealt: { shields: 0, hull: 0 }
        };
        ships.push(ship);
        renderGrid();
    }

    function openObstacleModal() {
        obstacleNameInput.value = '';
        obstacleTypeSelect.value = 'planet';
        obstacleSizeInput.value = 1;
        obstacleColorInput.value = '#808080';
        updateSizeExample();
        obstacleModal.style.display = 'flex';
    }

    function updateSizeExample() {
        const size = parseInt(obstacleSizeInput.value);
        sizeExample.style.width = `${size * 20}px`;
        sizeExample.style.height = `${size * 20}px`;
        sizeExample.style.backgroundColor = obstacleColorInput.value;
    }

    function createObstacle() {
        currentObstacle = {
            id: `obstacle-${obstacles.length}`,
            name: obstacleNameInput.value,
            type: obstacleTypeSelect.value,
            size: parseInt(obstacleSizeInput.value),
            color: obstacleColorInput.value,
            position: null
        };
        obstacles.push(currentObstacle);
        obstacleModal.style.display = 'none';
    }

    function renderGrid() {
        grid.querySelectorAll('.ship, .obstacle').forEach(element => element.remove());

        ships.forEach(ship => {
            if (ship.position !== null) {
                const cell = grid.children[ship.position];
                const shipElement = document.createElement('div');
                shipElement.classList.add('ship');
                shipElement.style.backgroundColor = ship.team === 'A' ? teamAColorInput.value : teamBColorInput.value;
                shipElement.style.width = '100%';
                shipElement.style.height = '100%';
                cell.appendChild(shipElement);
            }
        });

        obstacles.forEach(obstacle => {
            if (obstacle.position !== null) {
                const cell = grid.children[obstacle.position];
                const obstacleElement = document.createElement('div');
                obstacleElement.classList.add('obstacle');
                obstacleElement.style.backgroundColor = obstacle.color;
                obstacleElement.style.width = `${obstacle.size * 20}px`;
                obstacleElement.style.height = `${obstacle.size * 20}px`;
                obstacleElement.style.borderRadius = '50%';
                obstacleElement.style.position = 'absolute';
                obstacleElement.style.top = '50%';
                obstacleElement.style.left = '50%';
                obstacleElement.style.transform = 'translate(-50%, -50%)';
                cell.appendChild(obstacleElement);
            }
        });

        renderTeamShips();
        updateWinningBar();
    }

    function renderTeamShips() {
        teamA.innerHTML = '';
        teamB.innerHTML = '';
        ships.forEach(ship => {
            const shipElement = document.createElement('div');
            shipElement.textContent = ship.name;
            shipElement.dataset.id = ship.id;
            shipElement.draggable = !gameStarted;
            shipElement.addEventListener('click', () => showShipActionModal(ship.id));
            shipElement.addEventListener('dragstart', handleDragStart);
            shipElement.addEventListener('dragover', handleDragOver);
            shipElement.addEventListener('drop', handleDrop);
            if (ship.team === 'A') {
                teamA.appendChild(shipElement);
            } else {
                teamB.appendChild(shipElement);
            }
        });
    }

    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        const ship = ships.find(ship => ship.id === parseInt(id));
        const targetTeam = event.target.closest('.team').id === 'team-a' ? 'A' : 'B';
        if (ship.team !== targetTeam) {
            ship.team = targetTeam;
            renderTeamShips();
            renderGrid();
        }
    }

    function showShipActionModal(id) {
        currentShip = ships.find(ship => ship.id === id);
        if (!gameStarted) {
            shipActionModal.style.display = 'flex';
        } else {
            highlightSelectedShip(currentShip.position);
            showShipOverview(currentShip);
        }
    }

    function editShipStats() {
        shipNameInput.value = currentShip.name;
        shipRangeInput.value = currentShip.stats.range;
        shipHullInput.value = currentShip.stats.hull;
        shipShieldsInput.value = currentShip.stats.shields;
        shipGunPowerInput.value = currentShip.stats.gunPower;
        shipStatsModal.style.display = 'flex';
        shipActionModal.style.display = 'none';
    }

    function saveShipStats() {
        if (currentShip) {
            currentShip.name = shipNameInput.value;
            currentShip.stats.range = Math.min(3, parseInt(shipRangeInput.value));
            currentShip.stats.hull = Math.min(100, parseInt(shipHullInput.value));
            currentShip.stats.shields = Math.min(50, parseInt(shipShieldsInput.value));
            currentShip.stats.gunPower = Math.min(50, parseInt(shipGunPowerInput.value));
            renderTeamShips();
            shipStatsModal.style.display = 'none';
        }
    }

    function duplicateShip() {
        if (currentShip) {
            const newShip = { ...currentShip, id: ships.length, name: `${currentShip.name} Copy` };
            ships.push(newShip);
            renderGrid();
            shipStatsModal.style.display = 'none';
        }
    }

    function setShipPosition(index) {
        if (currentShip && !currentShip.position && !gameStarted) {
            currentShip.position = index;
            currentShip.initialPosition = index;
            renderGrid();
        }
    }

    function deleteShip() {
        if (currentShip) {
            ships.splice(ships.findIndex(ship => ship.id === currentShip.id), 1);
            renderGrid();
            shipActionModal.style.display = 'none';
        }
    }

    function resetGame() {
        if (confirm("Are you sure you want to reset the game?")) {
            location.reload();
        }
    }

    function startGame() {
        const firstTeam = prompt(`Which team should go first? (${teamNames['A']}/${teamNames['B']})`).toUpperCase();
        if (firstTeam === 'A' || firstTeam === 'B') {
            currentTeam = firstTeam;
        } else {
            currentTeam = Math.random() < 0.5 ? 'A' : 'B';
        }
        nextTurnButton.disabled = false;
        nextTurnButton.style.display = 'block';
        startGameButton.style.display = 'none';
        addShipButton.style.display = 'none';
        addObstacleButton.style.display = 'none';
        teamAColorInput.style.display = 'none';
        teamBColorInput.style.display = 'none';
        teamSelect.style.display = 'none';
        teamAJumpButton.style.display = 'block';
        teamBJumpButton.style.display = 'block';
        turnIndicator.textContent = `${teamNames[currentTeam]} - Turn ${currentTurn + 1}`;
        gameStarted = true;
        ships.forEach(ship => {
            ship.moved = false;
            ship.actionTaken = false;
        });
        importShipsInput.disabled = true; // Disable CSV import option
    }

    function nextTurn() {
        currentTurn++;
        currentTeam = currentTeam === 'A' ? 'B' : 'A';
        turnIndicator.textContent = `${teamNames[currentTeam]} - Turn ${currentTurn + 1}`;
        ships.forEach(ship => {
            ship.moved = false;
            ship.actionTaken = false;
            ship.damageDealt = { shields: 0, hull: 0 };
        });
        renderGrid();
    }

    function showShipOverview(ship) {
        shipOverview.style.display = 'block';
        const damageShields = ship.damageDealt.shields ? ` (-${ship.damageDealt.shields})` : '';
        const damageHull = ship.damageDealt.hull ? ` (-${ship.damageDealt.hull})` : '';
        shipOverview.innerHTML = `
            <h3>${ship.name}</h3>
            <p>Range: ${ship.stats.range}</p>
            <p>Hull: ${ship.stats.hull}${damageHull}</p>
            <p>Shields: ${ship.stats.shields}${damageShields}</p>
            <p>Gun Power: ${ship.stats.gunPower}</p>
        `;
    }

    function showEndGameScreen() {
        const teamAShipsLost = ships.filter(ship => ship.team === 'A' && ship.position === null).length;
        const teamBShipsLost = ships.filter(ship => ship.team === 'B' && ship.position === null).length;
        const teamAShipsRemaining = ships.filter(ship => ship.team === 'A' && ship.position !== null).length;
        const teamBShipsRemaining = ships.filter(ship => ship.team === 'B' && ship.position !== null).length;

        endGameSummary.innerHTML = `
            <p>${teamNames['A']} Ships Lost: ${teamAShipsLost}</p>
            <p>${teamNames['B']} Ships Lost: ${teamBShipsLost}</p>
            <p>${teamNames['A']} Ships Remaining: ${teamAShipsRemaining}</p>
            <p>${teamNames['B']} Ships Remaining: ${teamBShipsRemaining}</p>
            <h3>${teamAShipsRemaining > teamBShipsRemaining ? `${teamNames['A']} Wins!` : `${teamNames['B']} Wins!`}</h3>
        `;

        endGameModal.style.display = 'flex';
    }

    function handleMove(event) {
        if (currentShip && currentShip.team === currentTeam && !currentShip.moved && gameStarted) {
            const index = currentShip.position;
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            let newIndex = index;

            switch (event.key) {
                case 'ArrowUp':
                    if (row > 0) newIndex = index - gridSize;
                    break;
                case 'ArrowDown':
                    if (row < gridSize - 1) newIndex = index + gridSize;
                    break;
                case 'ArrowLeft':
                    if (col > 0) newIndex = index - 1;
                    break;
                case 'ArrowRight':
                    if (col < gridSize - 1) newIndex = index + 1;
                    break;
            }

            const distance = Math.abs(Math.floor(newIndex / gridSize) - row) + Math.abs(newIndex % gridSize - col);
            if (distance <= (moveSteps + 1) && distance <= currentShip.stats.range && !isOccupiedByAlly(newIndex) && !isOccupiedByObstacle(newIndex)) {
                currentShip.position = newIndex;
                moveSteps++;
                renderGrid();
                highlightSelectedShip(newIndex);
                logMove(`${currentShip.name} moved to (${Math.floor(newIndex / gridSize)}, ${newIndex % gridSize})`);
            }
            if (moveSteps >= currentShip.stats.range) {
                currentShip.moved = true;
                moveSteps = 0;
            }
        } else if (currentObstacle && !gameStarted) {
            const index = currentObstacle.position;
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            let newIndex = index;

            switch (event.key) {
                case 'ArrowUp':
                    if (row > 0) newIndex = index - gridSize;
                    break;
                case 'ArrowDown':
                    if (row < gridSize - 1) newIndex = index + gridSize;
                    break;
                case 'ArrowLeft':
                    if (col > 0) newIndex = index - 1;
                    break;
                case 'ArrowRight':
                    if (col < gridSize - 1) newIndex = index + 1;
                    break;
            }

            if (!isOccupiedByObstacle(newIndex) && !isOccupiedByAlly(newIndex)) {
                currentObstacle.position = newIndex;
                renderGrid();
                highlightSelectedObstacle(newIndex);
            }
        }
    }

    function handleGridClick(index) {
        const ship = ships.find(ship => ship.position === index);
        const obstacle = obstacles.find(obstacle => obstacle.position === index);

        if (ship && ship.team === currentTeam) {
            currentShip = ship;
            highlightSelectedShip(index);
            showShipOverview(ship);
        } else if (currentShip && !currentShip.position && !gameStarted) {
            setShipPosition(index);
        } else if (gameStarted && currentShip && currentShip.position !== index) {
            const targetShip = ships.find(ship => ship.position === index);
            if (targetShip && targetShip.team !== currentShip.team && !currentShip.actionTaken) {
                handleAttack(targetShip.id);
            }
        } else if (!gameStarted && currentObstacle) {
            currentObstacle.position = index;
            renderGrid();
            currentObstacle = null;
        } else if (!gameStarted && obstacle) {
            currentObstacle = obstacle;
            highlightSelectedObstacle(index);
        }
    }

    function highlightSelectedShip(index) {
        grid.querySelectorAll('.selected-ship').forEach(cell => {
            cell.classList.remove('selected-ship');
        });
        grid.children[index].classList.add('selected-ship');
    }

    function highlightSelectedObstacle(index) {
        grid.querySelectorAll('.selected-obstacle').forEach(cell => {
            cell.classList.remove('selected-obstacle');
        });
        grid.children[index].classList.add('selected-obstacle');
    }

    function handleAttack(targetId) {
        const targetShip = ships.find(ship => ship.id === targetId);
        if (targetShip && currentShip && currentShip.team === currentTeam) {
            showAttackConfirmModal(targetShip);
        }
    }

    function showAttackConfirmModal(targetShip) {
        attackConfirmModal.style.display = 'flex';
        confirmAttackButton.onclick = () => {
            attackConfirmModal.style.display = 'none';
            executeAttack(targetShip);
        };
        cancelAttackButton.onclick = () => attackConfirmModal.style.display = 'none';
    }

    function executeAttack(targetShip) {
        if (isObstacleBetween(currentShip.position, targetShip.position)) {
            logMove(`${currentShip.name}'s attack was blocked by an obstacle`);
            return;
        }

        const projectile = document.createElement('div');
        projectile.classList.add('projectile');
        document.body.appendChild(projectile);

        const startCell = grid.children[currentShip.position];
        const endCell = grid.children[targetShip.position];
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        projectile.style.left = `${startRect.left + startRect.width / 2 - 5}px`; // Adjust for half the size of the projectile
        projectile.style.top = `${startRect.top + startRect.height / 2 - 5}px`; // Adjust for half the size of the projectile

        const animation = projectile.animate([
            { left: `${startRect.left + startRect.width / 2 - 5}px`, top: `${startRect.top + startRect.height / 2 - 5}px` }, // Adjust for half the size of the projectile
            { left: `${endRect.left + endRect.width / 2 - 5}px`, top: `${endRect.top + endRect.height / 2 - 5}px` } // Adjust for half the size of the projectile
        ], {
            duration: 1000,
            easing: 'linear'
        });

        animation.onfinish = () => {
            projectile.remove();
            let damage = currentShip.stats.gunPower;
            if (targetShip.stats.shields > 0) {
                if (damage <= targetShip.stats.shields) {
                    targetShip.stats.shields -= damage;
                    targetShip.damageDealt.shields = damage;
                    damage = 0;
                } else {
                    targetShip.damageDealt.shields = targetShip.stats.shields;
                    damage -= targetShip.stats.shields;
                    targetShip.stats.shields = 0;
                }
            }
            if (damage > 0) {
                targetShip.stats.hull -= damage;
                targetShip.damageDealt.hull = damage;
                if (targetShip.stats.hull <= 0) {
                    targetShip.position = null;
                    targetShip.stats.hull = 0;
                }
            }
            currentShip.actionTaken = true;
            renderGrid();
            logMove(`${currentShip.name} attacked ${targetShip.name} for ${currentShip.stats.gunPower} damage`);
            checkEndGame();
        };
    }

    function isObstacleBetween(startIndex, endIndex) {
        const obstacleCells = getObstacleCells();
        const startRow = Math.floor(startIndex / gridSize);
        const startCol = startIndex % gridSize;
        const endRow = Math.floor(endIndex / gridSize);
        const endCol = endIndex % gridSize;

        const distance = Math.sqrt((endRow - startRow) ** 2 + (endCol - startCol) ** 2);
        const step = 1 / distance;
        let currentRow = startRow;
        let currentCol = startCol;

        for (let t = 0; t <= 1; t += step) {
            const currentIndex = Math.floor(currentRow) * gridSize + Math.floor(currentCol);
            if (obstacleCells.includes(currentIndex)) {
                return true;
            }
            currentRow += (endRow - startRow) * step;
            currentCol += (endCol - startCol) * step;
        }

        return false;
    }

    function getObstacleCells() {
        const cells = [];
        obstacles.forEach(obstacle => {
            const radius = obstacle.size / 2;
            const centerRow = Math.floor(obstacle.position / gridSize);
            const centerCol = obstacle.position % gridSize;
            for (let row = -radius; row <= radius; row++) {
                for (let col = -radius; col <= radius; col++) {
                    const distance = Math.sqrt(row ** 2 + col ** 2);
                    if (distance <= radius) {
                        const cellIndex = (centerRow + row) * gridSize + (centerCol + col);
                        if (cellIndex >= 0 && cellIndex < gridSize * gridSize) {
                            cells.push(cellIndex);
                        }
                    }
                }
            }
        });
        return cells;
    }

    function isOccupiedByAlly(index) {
        const occupyingShip = ships.find(ship => ship.position === index);
        return occupyingShip && occupyingShip.team === currentTeam;
    }

    function isOccupiedByObstacle(index) {
        return getObstacleCells().includes(index);
    }

    function showTooltip(event) {
        const index = event.target.dataset.index;
        const ship = ships.find(ship => ship.position === parseInt(index));
        const obstacle = obstacles.find(obstacle => obstacle.position === parseInt(index));
        if (ship) {
            tooltip.innerHTML = `
                <p>${ship.name}</p>
                <p>Range: ${ship.stats.range}</p>
                <p>Hull: ${ship.stats.hull}</p>
                <p>Shields: ${ship.stats.shields}</p>
                <p>Gun Power: ${ship.stats.gunPower}</p>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        } else if (obstacle) {
            tooltip.innerHTML = `
                <p>${obstacle.name}</p>
                <p>${obstacle.type.charAt(0).toUpperCase() + obstacle.type.slice(1)}</p>
                <p>Size: ${obstacle.size}</p>
                <p>Color: <span style="background-color:${obstacle.color}; display:inline-block; width:10px; height:10px;"></span></p>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        }
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    function updateWinningBar() {
        const teamAShips = ships.filter(ship => ship.team === 'A' && ship.position !== null).length;
        const teamBShips = ships.filter(ship => ship.team === 'B' && ship.position !== null).length;
        const totalShips = teamAShips + teamBShips;
        const teamAWinPercentage = (teamAShips / totalShips) * 100;
        const teamBWinPercentage = (teamBShips / totalShips) * 100;
        winningBar.style.background = `linear-gradient(to right, ${teamAColorInput.value} ${teamAWinPercentage}%, ${teamBColorInput.value} ${teamBWinPercentage}%)`;
    }

    function checkEndGame() {
        const teamAShipsRemaining = ships.filter(ship => ship.team === 'A' && ship.position !== null).length;
        const teamBShipsRemaining = ships.filter(ship => ship.team === 'B' && ship.position !== null).length;
        if (teamAShipsRemaining === 0 || teamBShipsRemaining === 0) {
            showEndGameScreen();
        }
    }

    function retreat(team) {
        const teamShips = ships.filter(ship => ship.team === team && ship.position !== null);
        const lostShips = Math.floor(teamShips.length / 2);
        for (let i = 0; i < lostShips; i++) {
            const randomIndex = Math.floor(Math.random() * teamShips.length);
            const [lostShip] = teamShips.splice(randomIndex, 1);
            lostShip.position = null;
        }
        teamShips.forEach(ship => {
            ship.position = null;
        });
        renderGrid();
        logMove(`All ships of ${teamNames[team]} have retreated. ${lostShips} ships were lost.`);
        endGame(team === 'A' ? 'B' : 'A'); // End game and give the other team the win
    }

    function endGame(winningTeam) {
        const teamAShipsLost = ships.filter(ship => ship.team === 'A' && ship.position === null).length;
        const teamBShipsLost = ships.filter(ship => ship.team === 'B' && ship.position === null).length;
        const teamAShipsRemaining = ships.filter(ship => ship.team === 'A' && ship.position !== null).length;
        const teamBShipsRemaining = ships.filter(ship => ship.team === 'B' && ship.position !== null).length;

        endGameSummary.innerHTML = `
            <p>${teamNames['A']} Ships Lost: ${teamAShipsLost}</p>
            <p>${teamNames['B']} Ships Lost: ${teamBShipsLost}</p>
            <p>${teamNames['A']} Ships Remaining: ${teamAShipsRemaining}</p>
            <p>${teamNames['B']} Ships Remaining: ${teamBShipsRemaining}</p>
            <h3>${teamNames[winningTeam]} Wins!</h3>
        `;

        endGameModal.style.display = 'flex';
    }

    function logMove(action) {
        const logEntry = document.createElement('div');
        logEntry.textContent = action;
        moveTracker.appendChild(logEntry);
        moveTracker.scrollTop = moveTracker.scrollHeight;
    }

    function renameTeam(team) {
        if (!gameStarted) {
            const newName = prompt(`Enter the new name for ${teamNames[team]}:`);
            if (newName) {
                teamNames[team] = newName;
                if (team === 'A') {
                    teamATitle.innerHTML = `${newName} <input type="color" id="team-a-color" value="${teamAColorInput.value}" class="color-picker">`;
                    teamSelect.options[0].text = newName;
                } else {
                    teamBTitle.innerHTML = `${newName} <input type="color" id="team-b-color" value="${teamBColorInput.value}" class="color-picker">`;
                    teamSelect.options[1].text = newName;
                }
                renderGrid();
            }
        }
    }

    function promptSaveGame() {
        const saveFileName = prompt('Enter the name for your save file:');
        if (saveFileName) {
            saveGame(saveFileName);
        }
    }

    function saveGame(saveFileName) {
        const saveState = {
            ships,
            obstacles,
            currentTurn,
            currentTeam,
            teamNames,
            moveLog: Array.from(moveTracker.children).map(entry => entry.textContent)
        };
        const blob = new Blob([JSON.stringify(saveState)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${saveFileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleLoadGame(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const saveState = JSON.parse(e.target.result);
                loadGame(saveState);
            };
            reader.readAsText(file);
        }
    }

    function loadGame(saveState) {
        ships.length = 0;
        obstacles.length = 0;
        ships.push(...saveState.ships);
        obstacles.push(...saveState.obstacles);
        currentTurn = saveState.currentTurn;
        currentTeam = saveState.currentTeam;
        teamNames = saveState.teamNames;
        teamATitle.innerHTML = `${teamNames['A']} <input type="color" id="team-a-color" value="${teamAColorInput.value}" class="color-picker">`;
        teamBTitle.innerHTML = `${teamNames['B']} <input type="color" id="team-b-color" value="${teamBColorInput.value}" class="color-picker">`;
        teamSelect.innerHTML = `<option value="A">${teamNames['A']}</option><option value="B">${teamNames['B']}</option>`;
        moveTracker.innerHTML = '';
        saveState.moveLog.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.textContent = log;
            moveTracker.appendChild(logEntry);
        });
        renderGrid();
    }

    function handleImportShips(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csv = e.target.result;
                const data = csvToArray(csv);
                data.forEach(shipData => {
                    addImportedShip(shipData);
                });
                renderGrid();
            };
            reader.readAsText(file);
        }
    }

    function csvToArray(str, delimiter = ",") {
        const headers = ["name", "range", "hull", "shields", "gunPower", "team"];
        const rows = str.slice(str.indexOf("\n") + 1).split("\n");

        return rows.map(row => {
            const values = row.split(delimiter);
            const ship = headers.reduce((obj, header, index) => {
                obj[header] = values[index] ? values[index].trim() : ""; // Ensure values are trimmed and handle undefined
                return obj;
            }, {});
            return ship;
        });
    }

    function addImportedShip(data) {
        if (!data.name || !data.range || !data.hull || !data.shields || !data.gunPower || !data.team) {
            console.error('Invalid ship data:', data);
            return;
        }
        const team = data.team.toUpperCase();
        const ship = {
            id: ships.length,
            team: team === 'A' ? 'A' : 'B', // Default to B if not A
            name: data.name,
            position: null,
            stats: {
                range: parseInt(data.range),
                hull: parseInt(data.hull),
                shields: parseInt(data.shields),
                gunPower: parseInt(data.gunPower)
            },
            moved: false,
            actionTaken: false,
            initialPosition: null,
            damageDealt: { shields: 0, hull: 0 }
        };
        ships.push(ship);
    }

    function downloadMoveRecord() {
        const moveLog = Array.from(moveTracker.children).map(entry => entry.textContent).join('\n');
        const blob = new Blob([moveLog], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'move-record.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    teamAJumpButton.addEventListener('click', () => retreat('A'));
    teamBJumpButton.addEventListener('click', () => retreat('B'));
});
