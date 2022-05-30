// VARIABLES
let grids = Array.from(document.querySelectorAll('.grid')),
	resetIcon = document.querySelector('.reset-icon'),
	player1 = document.querySelector('.player-1'),
	player2 = document.querySelector('.player-2');

let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');

let grid = [ [ '-', '-', '-' ], [ '-', '-', '-' ], [ '-', '-', '-' ] ],
	current,
	players = {
		X: '1',
		O: '2'
	},
	timesPlayed = 0,
	gridCoordinates = [ '0,0', '0,1', '0,2', '1,0', '1,1', '1,2', '2,0', '2,1', '2,2' ];

// FUNCTIONS
function getCurrent() {
	let toggle = true;
	return () => {
		toggle = !toggle;
		if (!toggle) return 'X';
		return 'O';
	};
}
//closure formed
current = getCurrent();

function getLineCoordinates(path) {
	// line from x1,y1 -> x2,y2
	// returns coordinates [x1, y1, x2, y2]

	// row1: 50,75 -> 550, 75
	// row2: 50,225 -> 550, 225
	// row3: 50,375 -> 550, 375
	// col1: 100,37.5 -> 100, 412.5
	// col2: 300, 37.5 -> 300, 412.5
	// col3: 500, 37.5 -> 500, 412.5
	// y = -(3/4)x
	// diag1: 50, 37.5 -> 550, 412.5
	// diag2: 550, 37.5 -> 50, 412.5

	switch (path) {
		case 'row1':
			return [ 50, 75, 550, 75 ];
		case 'row2':
			return [ 50, 225, 550, 225 ];
		case 'row3':
			return [ 50, 375, 550, 375 ];

		case 'col1':
			return [ 100, 37.5, 100, 412.5 ];
		case 'col2':
			return [ 300, 37.5, 300, 412.5 ];
		case 'col3':
			return [ 500, 37.5, 500, 412.5 ];

		case 'diag1':
			return [ 50, 37.5, 550, 412.5 ];
		case 'diag2':
			return [ 550, 37.5, 50, 412.5 ];
	}
}

function drawLine(path) {
	context.beginPath();
	context.lineWidth = 5;
	context.strokeStyle = '#adb5bd';

	let [ x1, y1, x2, y2 ] = getLineCoordinates(path);

	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

function removeLine() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function checkGrid(grid, coordinates, currentInput) {
	let path = null;

	//to check if 3 consecutive in a row
	function checkRow(row) {
		for (let col = 0; col < 3; col++) {
			if (grid[row][col] != currentInput || grid[row][col] == '-') return false;
		}
		path = `row${parseInt(row) + 1}`;
		return true;
	}

	//to check if 3 consecutive in a column
	function checkColumn(col) {
		for (let row = 0; row < 3; row++) {
			if (grid[row][col] != currentInput || grid[row][col] == '-') return false;
		}
		path = `col${parseInt(col) + 1}`;
		return true;
	}

	//to check if 3 consecutive in a diagonal
	function checkDiagonal(coordinates) {
		let flag = false,
			whichDiag = { diag1: false, diag2: false };

		//check 0,0 to 2,2 diag
		if ([ '0,0', '2,2' ].includes(coordinates) || coordinates == '1,1') {
			flag = true;
			whichDiag.diag1 = true;
			for (let row = 0, col = 0; row < 3; row++, col++) {
				if (grid[row][col] != currentInput || grid[row][col] == '-') {
					flag = false;
					whichDiag.diag1 = false;
					break;
				}
			}
		}

		//check 0,2 to 2,0 diag || check both diags if center coordinates
		if ([ '0,2', '2,0' ].includes(coordinates) || coordinates == '1,1') {
			flag = true;
			whichDiag.diag2 = true;
			for (let row = 0, col = 2; row < 3; row++, col--) {
				if (grid[row][col] != currentInput || grid[row][col] == '-') {
					flag = false;
					whichDiag.diag2 = false;
					break;
				}
			}
		}

		if (whichDiag.diag1) path = 'diag1';
		else if (whichDiag.diag2) path = 'diag2';

		return flag;
	}

	if (checkRow(coordinates.split(',')[0]) || checkColumn(coordinates.split(',')[1]) || checkDiagonal(coordinates))
		return { match: true, path };
	else return { match: false, path };
}

function toggleCursorAndShadow(show) {
	if (!show) {
		document.body.classList.remove('add-x-cursor');
		document.body.classList.remove('add-o-cursor');
		grids.forEach((grid) => grid.classList.add('remove-cursor-box-shadow'));
	} else {
		document.body.classList.remove('add-o-cursor');
		document.body.classList.add('add-x-cursor');
	}
}

function handleGameOver(currentInput, tie) {
	if (!tie) {
		let [ winner, loser ] =
			players[currentInput] == 1 ? [ '.player-1', '.player-2' ] : [ '.player-2', '.player-1' ];

		document.querySelector(winner).classList.add('won');
		document.querySelector(loser).classList.add('lost');

		return;
	}
	player1.classList.add('lost');
	player2.classList.add('lost');
}

function resetGame() {
	grid = [ [ '-', '-', '-' ], [ '-', '-', '-' ], [ '-', '-', '-' ] ];
	current = getCurrent();
	timesPlayed = 0;

	player1.classList.remove('won');
	player2.classList.remove('won');
	player1.classList.remove('lost');
	player2.classList.remove('lost');

	grids.forEach((grid) => {
		grid.innerText = '';
		grid.classList.remove('remove-cursor-box-shadow');
		grid.addEventListener('click', handleGridClick);
	});

	toggleCursorAndShadow(true);

	removeLine();
}

function handleGridClick(e) {
	//get current input whether x or o, show in grid ui
	let currentInput = current();
	e.target.innerText = currentInput;

	//toggle cursor
	document.body.classList.toggle('add-x-cursor');
	document.body.classList.toggle('add-o-cursor');
	//remome event listener
	e.target.removeEventListener('click', handleGridClick);
	//disable cursor
	e.target.classList.add('remove-cursor-box-shadow');

	//get coordinates and store in grid,
	let coordinates = e.target.getAttribute('data-coordinates').split(',');
	grid[coordinates[0]][coordinates[1]] = currentInput;

	timesPlayed++;

	//check if any player has won
	let result = checkGrid(grid, coordinates.join(','), currentInput);

	if (result.match) {
		toggleCursorAndShadow(false);
		handleGameOver(currentInput, false);
		drawLine(result.path);
	}
	if (timesPlayed == 9) {
		handleGameOver(currentInput, true);
	}
}

// EVENTS
grids.forEach((grid) => grid.addEventListener('click', handleGridClick));
resetIcon.addEventListener('click', resetGame);
