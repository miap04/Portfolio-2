import { ANSI } from "./ansi.mjs";

const ART = [
"  _______ _____ _____   _______       _____   _______ ____  ______ ",
" |__   __|_   _/ ____| |__   __|/\\   / ____| |__   __/ __ \\|  ____|",
"    | |    | || |         | |  /  \\ | |         | | | |  | | |__   ",
"    | |    | || |         | | / /\\ \\| |         | | | |  | |  __|  ",
"    | |   _| || |____     | |/ ____ \\ |____     | | | |__| | |____ ",
"    |_|  |_____\\_____|    |_/_/    \\_\\_____|    |_|  \\____/|______|"
]
function showSplashScreen() {
    for(let i = 0; i < ART.length; i++) {
        if(i == 0 || i == 1) {
            console.log(ANSI.COLOR.GREEN + ART[i] + ANSI.RESET);
        }
        else if(i == 2 || i == 3) {
            console.log(ANSI.COLOR.RED + ART[i] + ANSI.RESET);
        }
        else if(i == 4 || i == 5) {
            console.log(ANSI.COLOR.YELLOW + ART[i] + ANSI.RESET);
        }
    } 
}

export default showSplashScreen;