import { print, askQuestion } from "./io.mjs"
import { debug, DEBUG_LEVELS } from "./debug.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";




const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const PVP = 1;
const PVC = 2;
const UNDECIDED = 0;
const DRAW = 2;

const MENU_CHOICES = {
    MENU_CHOICE_START_GAME_PVP: 1,
    MENU_CHOICE_START_GAME_PVC: 2,
    MENU_CHOICE_SHOW_LANGUAGE: 3,
    MENU_CHOICE_EXIT_GAME: 4
};

const NO_CHOICE = -1;

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;


clearScreen();
showSplashScreen();
setTimeout(start, 2500);



//#region game functions -----------------------------

async function start() {
    do {
        let chosenAction = NO_CHOICE;
        chosenAction = await showMenu();
        if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME_PVP) 
        {
            await runGame(PVP);
        }
        else if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME_PVC) {
            await runGame(PVC);
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_SHOW_LANGUAGE) {
            await showLanguageMenu();
        } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_EXIT_GAME) {
            clearScreen();
            process.exit();
        }

    } while (true)

}

async function runGame(gameMode) {

    let isPlaying = true;

    while (isPlaying) { 
        initializeGame(); 
        if (gameMode == PVP) {
            isPlaying = await playPVPGame(); 
        }
        else if (gameMode == PVC) {
        isPlaying = await playPVCGame();
        }
    }
}

async function showMenu() {

    let choice = -1;  
    let validChoice = false;    

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + language.MENU + ANSI.RESET);
        print(language.OPTION_1);
        print(language.OPTION_2);
        print(language.OPTION_3);
        print(language.OPTION_4);

        choice = await askQuestion("");

        if ([MENU_CHOICES.MENU_CHOICE_START_GAME_PVP, MENU_CHOICES.MENU_CHOICE_START_GAME_PVC, MENU_CHOICES.MENU_CHOICE_SHOW_LANGUAGE, MENU_CHOICES.MENU_CHOICE_EXIT_GAME].includes(Number(choice))) {
            validChoice = true;
        }
    }
    return choice;
}

async function showLanguageMenu()
{
    let choice = -1;
    let validChoice = false;

    while (!validChoice) {
        clearScreen();
        print(ANSI.COLOR.YELLOW + language.LANGUAGE_MENU + ANSI.RESET);
        print(language.LANGUAGE_OPTION_1);
        print(language.LANGUAGE_OPTION_2);

        choice = await askQuestion("");

        if ([1, 2].includes(Number(choice))) {
            validChoice = true;
        }
    }

    if (choice == 1) {
        language = DICTIONARY.en;
    }
    else if (choice == 2) {
        language = DICTIONARY.no;
    }
}

async function playPVPGame() {
    let outcome;

    do {
        clearScreen();
        showGameBoardWithCurrentState();
        showHUD();
        let move = await getGameMoveFromtCurrentPlayer();
        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome == UNDECIDED)
    if (outcome == DRAW) {
        print(language.DRAW);
    }
    else
    {
        showGameSummary(outcome);
    }
    return await askWantToPlayAgain();
}

async function playPVCGame() {
    let outcome;
    do {
        clearScreen();
        showGameBoardWithCurrentState();
        let move;
        if(currentPlayer == PLAYER_1)
        {
            move = await getGameMoveFromtCurrentPlayer();
        }
        else if (currentPlayer == PLAYER_2) 
        {
            move = getComputerMove();
        }
        updateGameBoardState(move);
        outcome = evaluateGameState();
        changeCurrentPlayer();
    } while (outcome == UNDECIDED)
    if (outcome == DRAW) {
        print(language.DRAW);
    }
    else
    {
        showGameSummary(outcome);
    }
    

    return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
    let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
    let playAgain = true;
    if (answer && answer.toLowerCase()[0] != language.CONFIRM) {
        playAgain = false;
    }
    return playAgain;
}

function showGameSummary(outcome) {
    clearScreen();
    let winningPlayer = (outcome > UNDECIDED) ? 1 : 2;
    print(language.WINNING_PLAYER + winningPlayer);
    showGameBoardWithCurrentState();
    print(language.GAME_OVER);
}

function changeCurrentPlayer() {
    currentPlayer *= -1;
}

function evaluateGameState() {
    let sum = 0;
    let state = 0;
    let playerOneWinningState = 3;
    let playerTwoWinningState = -3;
    let allCellsFilled = true;

    for (let row = 0; row < GAME_BOARD_SIZE; row++) {

        for (let col = 0; col < GAME_BOARD_SIZE; col++) {
            sum += gameboard[row][col];
            if (gameboard[row][col] == 0) {
                allCellsFilled = false;
            }
        }

        if (Math.abs(sum) == 3) {
            state = sum;
        }
        sum = 0;
    }

    for (let col = 0; col < GAME_BOARD_SIZE; col++) {

        for (let row = 0; row < GAME_BOARD_SIZE; row++) {
            sum += gameboard[row][col];
        }

        if (Math.abs(sum) == 3) {
            state = sum;
        }

        sum = 0;
    }

    if(gameboard[0][0] + gameboard[1][1] + gameboard[2][2] == 3 || gameboard[0][2] + gameboard[1][1] + gameboard[2][0] == 3)
    {
        state = playerOneWinningState;
    }
    else if(gameboard[0][0] + gameboard[1][1] + gameboard[2][2] == -3 || gameboard[0][2] + gameboard[1][1] + gameboard[2][0] == -3)
    {
        state = playerTwoWinningState;
    }

    if (state != Math.abs(3) && allCellsFilled) {
        return DRAW;
    }
    let winner = state / 3;
    return winner;
}

function updateGameBoardState(move) 
{
    const ROW_ID = 0;
    const COLUMN_ID = 1;
    gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromtCurrentPlayer() {
    let position = null;
    const ADJUSTMENTCONSTANT = 1;
    do {
        let rawInput = await askQuestion(language.PLACE_YOUR_MOVE);
        position = rawInput.split(" ");
        position[0] = position[0] - ADJUSTMENTCONSTANT;
        position[1] = position[1] - ADJUSTMENTCONSTANT;
    } while (isValidPositionOnBoard(position) == false)

    return position
}

function getComputerMove() {
    let row, col;
    do {
        row = Math.floor(Math.random() * GAME_BOARD_SIZE);
        col = Math.floor(Math.random() * GAME_BOARD_SIZE);
    } while (gameboard[row][col] !== 0);
    return [row, col];
}

function isValidPositionOnBoard(position) {

    if (position.length < 2) {
        return false;
    }

    let isValidInput = true;
    if (position[0] * 1 != position[0] && position[1] * 1 != position[1]) {
        isValidInput = false;
    } else if (position[0] > GAME_BOARD_SIZE && position[1] > GAME_BOARD_SIZE) {
        isValidInput = false;
    }
    else if (gameboard[position[0]][position[1]] != 0) {
        isValidInput = false;
    }


    return isValidInput;
}

function showHUD() {
    let playerDescription = language.PLAYER_ONE_DESCRIPTION;
    if (PLAYER_2 == currentPlayer) 
    {
        playerDescription = language.PLAYER_TWO_DESCRIPTION;
    }
    print(language.PLAYER + playerDescription + language.YOUR_TURN);
}

function showGameBoardWithCurrentState() {
    print("    1   2   3");
    print("  ╔═══╦═══╦═══╗");
    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let rowOutput = "";
        let emptyCell = "_";
        let playerOneOutput = "X";
        let playerTwoOutput = "O";
        let divider = " ║ ";
        for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++) {
            
            let cell = gameboard[currentRow][currentCol];
            if (cell == 0) {
                rowOutput += emptyCell + divider;
            }
            else if (cell > 0) {
                rowOutput += ANSI.COLOR.GREEN + playerOneOutput + ANSI.RESET + divider;
            } else {
                rowOutput += ANSI.COLOR.RED + playerTwoOutput + ANSI.RESET + divider; 
            }
        }
        print(currentRow+1 + divider + rowOutput);
        if (currentRow < 2)
        {
            print("  ╠═══╬═══╬═══╣");
        }
    }
    print("  ╚═══╩═══╩═══╝");
}

function initializeGame() {
    gameboard = createGameBoard();
    currentPlayer = PLAYER_1;
}

function createGameBoard() {

    let newBoard = new Array(GAME_BOARD_SIZE);

    for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
        let row = new Array(GAME_BOARD_SIZE);
        for (let currentColumn = 0; currentColumn < GAME_BOARD_SIZE; currentColumn++) {
            row[currentColumn] = 0;
        }
        newBoard[currentRow] = row;
    }

    return newBoard;

}

function clearScreen() {
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}



//#endregion

