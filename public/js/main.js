$(document).ready( () => {

/******************Global*******************/
    const socket = io();
    let playerID = "";
    let players = {};
    let serverID = "";
    const speed = 15;
    let bullets = [];
    let heros = [];
    let enemies = [];

    const gameContainerHeight = 600;
    const gameContainerWidth = 700;

    /* set game-container size */
    const gameContainer = document.querySelector('#game-container');
    gameContainer.style.height = `${gameContainerHeight}px`;
    gameContainer.style.width = `${gameContainerWidth}px`;

/*********************Socket.io emit/listen**************************** */
    socket.on('new_game', (data) => {
        createNewPlayer(data);
        const startButton = document.createElement('button');
        startButton.textContent = 'Start';
        startButton.id = 'start';
        gameContainer.appendChild(startButton);
    }); 

    socket.on('new_user', (data) => {
        createNewPlayer(data);
        socket.emit('new_player_created', players[playerID]);
    }); 

    socket.on('display-game-content', (data) => {
        serverID = data.server;
        enemies.push(...data.newEnemy);
        setInterval(GameLoop, 20);
    }); 

    socket.on('append-new-enemies', (newEnemy) => {
        enemies.push(...newEnemy);
    }); 

    socket.on('append_new_player', (data) => {
        console.log("APPEND",data);
        heros.push(data.id);
        players[data.id] = data;
        displayHero();
    });

    socket.on('update_player_movement', (data) => {
        console.log("update_player_movement! ", data);
        players[data.id] = data;
    }); 
    
    socket.on('update_bullets', (data) => {
        bullets.push(data);
    }); 
    
/**********************Functions*************************/
const createNewPlayer = (data) => {
    playerID = data.id;
    players = data.gameData;
    heros = data.existingUsers;
    displayHero();
    console.log("New Player ID: ", playerID);
    console.log("In Game Players: ", players);
}

const detectCollision = (bulletX, bulletY, enemyX, enemyY) => {
    if(
      bulletX + 28 >= enemyX && //right
      bulletX <= enemyX + 28 && //left
      bulletY + 28 >= enemyY && //top
      bulletY <= enemyY + 28 //bottom
    ) {
        console.log("Boom2x!! sapul!!");
        return true;
    }
}
const setTimeoutPromise = (delay) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
const moveEnemiesAndBullets = async() => {
    console.log("enemies length: ",enemies.length);
    /* bullets */
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= 10;
        if(bullets[i].y <= 0) {
            bullets.splice(i,1);
        }
    }
    /* enemies */
    for (let i = 0; i < enemies.length; i++) {
        /* the enemy will move if status 0 */
        if(enemies[i].status == 0){
            enemies[i].y += 1;
        }
        if(enemies[i].y > gameContainerHeight-50) {
            enemies.splice(i,1);
        }
        /* apply detect collisions between enemies and bullets */
        for(let j = 0; j < bullets.length; j++) {
            if(detectCollision(bullets[j].x, bullets[j].y, enemies[i].x, enemies[i].y) && enemies[i].status == 0) {
                enemies[i].status = 1;
                enemies[i].backgroundPosition = "-115px -35px";
                bullets.splice(j,1);
                players[playerID].score += 10;
                document.getElementById("score").textContent = players[playerID].score;
                await setTimeoutPromise(200);
                enemies.splice(i,1);
                console.log('enemies remaining: ', enemies.length);
            }
        }
        
    }
    if(serverID == playerID && enemies.length == 0 ) {
        console.log("Level-completed!");
        socket.emit("level-completed");
    }
}

const displayEnemies = () => {
    var content = "";

    for (let i = 0; i < enemies.length; i++) {
        content +=
        "<div class='enemy' style='top: " +
        enemies[i].y + "px; left:" +
        enemies[i].x + "px; background-position:"+
        enemies[i].backgroundPosition+";'></div>";
    }

    document.getElementById("enemies").innerHTML = content;
}

const displayHero = () => {

    let heroContent = "";
    for (let i = 0; i < heros.length; i++) {
        heroContent +=
        "<div class='hero' style='top: " +
        players[heros[i]].position.y + "px; left:" +
        players[heros[i]].position.x + "px; background-image: url("+ players[heros[i]].character +");'></div>";
    }
    document.getElementById("hero").innerHTML = heroContent;

    let bulletContent = "";
    for (let i = 0; i < bullets.length; i++) {
        bulletContent +=
        "<div class='bullet' style='top: " +
        bullets[i].y + "px" +
        "; left:" +
        bullets[i].x + "px" +
        "'></div>";
    }
    document.getElementById("bullets").innerHTML = bulletContent;
}

const shoot = (id=playerID) => {
    socket.emit('shoot', { x: players[id].position.x + 8, y: players[id].position.y - 5 });
    socket.emit('player-movement', players[playerID]);
}
    /*****************JS EventListener******************************** */

    document.addEventListener("keydown", (event) => {
        if(event.key === "ArrowLeft" && players[playerID].position.x - speed >= 0 || event.key === "ArrowRight" && players[playerID].position.x + speed <= gameContainerWidth-50 || event.key === "ArrowUp" && players[playerID].position.y - speed >= 0 || event.key === "ArrowDown" && players[playerID].position.y + speed <= gameContainerHeight-50 && event.key === " ") {
            event.preventDefault();
            socket.emit('player-movement', players[playerID]);
        } 
        if (event.key === "ArrowLeft" && players[playerID].position.x - speed >= 0) {
            players[playerID].position.x -= speed;
        }
        if (event.key === "ArrowRight" && players[playerID].position.x + speed <= gameContainerWidth-50) {
            players[playerID].position.x += + speed;
        }
        if (event.key === "ArrowUp" && players[playerID].position.y - speed >= 0) {
            players[playerID].position.y -= speed;
        }
        if (event.key === "ArrowDown" && players[playerID].position.y + speed <= gameContainerHeight-50) {
            players[playerID].position.y += speed;
        }
        if (event.key === " ") {
            shoot(); 
        }
    });
    /* start the Game */
    $(document).on('click','#start', function(){
        $(this).hide();
        socket.emit('start-game', playerID);
    });

    const GameLoop = () => {
        moveEnemiesAndBullets();
        displayHero();
        displayEnemies();
    }

});