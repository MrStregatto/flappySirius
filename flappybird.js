// Game flow
let gameStarted = false;
let scoreSaved = false;
let gameOver = false;
let score = 0;

// menu
let menu;

// board
let board;
let boardWidth = 360;
let boardHeight = 640;
/** @type {CanvasRenderingContext2D} */
let context;

// bird
let birdWidth = 34; // width/height ratio = 408/228 == 17/12
let birdHeight = 24;
let birdXPos = boardWidth/8;
let birdYPos = boardHeight/2;
let birdImg;
// let birdImgs = [];
// let birdImgsIndex = 0;

// creo una classe di bird
let bird = {
    x : birdXPos,
    y : birdYPos,
    width : birdWidth,
    height : birdHeight
}

// tubi
let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 384/3072 == 1/8
let pipeHeight = 512;
let pipeXPos = boardWidth;
let pipeYPos = 0;

let topPipeImg;
let botPipeImg;

// fisica gioco
let velocityX = -2; // verso sinistra
let velocityY = 0; // salto dell'uccello
let gravity = 0.4;

// caricamento degli audio
let wingSound = new Audio("./audio/sfx_wing.wav");
let hitSound = new Audio("./audio/sfx_hit.wav");
let bgm = new Audio("./audio/tiny_paws.mp3");
let dieSound = new Audio("./audio/sfx_die.wav");
bgm.loop = true;
bgm.volume = 0.1;



// caricamento finestra
window.onload = function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");

    // Gestione Menu
    menu = document.getElementById("menu");

    // collego le funzioni ai bottoni html
    document.getElementById("playButton")
            .addEventListener("click", startGame);

    // document.getElementById("scoreBtn")
            // .addEventListener("click", showLeaderboard);


    // --------- gestione video bird
    // disegno un rettangolo per debug 
    /*context.fillStyle = "green";
    context.fillRect(bird.x, bird.y, bird.width, bird.height); */

    // load imagine singola (serve per futuro)
    birdImg = new Image();
    birdImg.src = "./grafica/flappybird.png";


    // caricamento immagini pipes sopra e sotto
    topPipeImg = new Image();
    topPipeImg.src = "./grafica/toppipe.png";

    botPipeImg = new Image();
    botPipeImg.src = "./grafica/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //ogni 1,5 secondio
    setInterval(animateBird, 100); //ogni 1/10 secondi


    // inputs
    // Tastiera
    document.addEventListener('keydown', (e) => {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"){
        jump();
    }
    });

    // Mouse e tocco (da verificare)
    document.addEventListener('pointerdown', (e) => {
        if (e.button === 0) {
            jump();
        }
    });
}

function startGame(mode){
    bird.y = birdYPos;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    gameStarted = true;

    menu.style.display = "none";

    bgm.currentTime = 0;
    bgm.play();


}


function endGame(){
    if (gameOver) return;      // puo' essere chiamata due volte nello stesso frame
    gameOver = true;

    bgm.pause();
    bgm.currentTime = 0;

    // lascia la scritta GAME OVER a video, poi rimette il menu
    setTimeout(function(){
        gameStarted = false;
        menu.style.display = "";   // svuota lo stile inline: torna a decidere il CSS
    }, 1200);
}

// funzione che aggiorna di continuo l'immagine
function update(){
    requestAnimationFrame(update);

    if(!gameStarted || gameOver){
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // aggiungo il background
    
    // 'disegno' l'uccello
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // aggiunge la gravità all'uccello e non può andare oltre lo schermo
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);


    if(bird.y > board.height){
        endGame();
    }

    //ora i tubi
    for (let i=0; i < pipeArray.length; i++){
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if(!pipe.passed && bird.x > pipe.x + pipe.width){
            score += 0.5; // così perchè sono due i tubi
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)){
            hitSound.play();
            endGame();
        }
    }

    // eliminatubi
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift();
    }

    // punteggio
    drawScore();


    if(gameOver){
    drawGameOver();
    }
}

// logica dei tubes
function placePipes(){
    if(gameOver){
        return;
    }

    //math va da 0 a 1 ( compreso 0.3, 0.66)
    let randomPipeY = pipeYPos - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeXPos,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }


    pipeArray.push(topPipe); // questo comando aggiunge un elemento ad un array

    let botPipe = {
        img : botPipeImg,
        x : pipeXPos,
        y: randomPipeY + pipeHeight + openSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(botPipe);

}

function jump() {
    if(gameOver) return;
    if(!gameStarted) return;

    wingSound.currentTime = 0;
    wingSound.play();

    velocityY = -6;
}

function detectCollision(a, b){
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y

}

function drawScore(){
    context.font = "45px sans-serif";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.lineJoin = "round";
    context.lineWidth = 6;
    context.strokeStyle = "black";
    context.strokeText(score, boardWidth/2, 45);
    context.fillStyle = "white";
    context.fillText(score, boardWidth/2, 45);
}

function drawGameOver(){
        context.font = "45px sans-serif";
        context.lineJoin = "round";
        context.lineWidth = 6;
        context.strokeStyle = "black";
        context.strokeText("GAME OVER", 45, 140);
        context.fillStyle = "white";
        context.fillText("GAME OVER", 45, 140)
}