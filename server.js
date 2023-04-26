const express = require('express');
const path = require("path");
const app = express();

app.use(express.static(__dirname + "/public"));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

const server = app.listen(8080);
const io = require('socket.io')(server);

const Users = require(`./class/Users`);
const Heros = require(`./class/Heros`);
const Enemies = require(`./class/Enemies`);

let users = null;
let numUsers = 0;

io.on('connection', (socket) => {

    if(numUsers == 0) {
        users = new Users(socket.id, new Heros(socket.id, numUsers+=1));
        console.log("New Game created!");
        socket.emit('new_game', {id: socket.id, gameData: users.user, existingUsers: users.sessionID});
    } else {
        users.newUser(socket.id, new Heros(socket.id, numUsers+=1));
        socket.emit('new_user', {id: socket.id, gameData: users.user, existingUsers: users.sessionID});
    }
    console.log(users);
    console.log(numUsers);

/* new player created */
    socket.on('new_player_created', (data) => {
        console.log("New player successfully created! ",data);
        socket.broadcast.emit('append_new_player', data);
    });

/* start the game */
    socket.on('start-game', (id) => {
        console.log("Let the game begin!");
        io.emit('display-game-content',{server: id, newEnemy: Enemies.shuffleEnemyPosition()});
    });

/* level completed - start new level */
    socket.on('level-completed', () => {
        console.log("Level completed");
        io.emit('append-new-enemies', Enemies.shuffleEnemyPosition());
    });

/* update player movement */
    socket.on('player-movement', (data) => {
        users.user[data.id] = data;
        socket.broadcast.emit('update_player_movement', data);
        console.log("player movements: ", data);
    });
/* players shoot */
    socket.on('shoot', (data) => {
        users.user[data.id] = data;
        io.emit('update_bullets', data);
    });


/* user disconnected to server */
    socket.on('disconnect', () => {
        numUsers-=1;
        console.log("User: " + socket.id + " disconnected" );
        delete users.user[socket.id];
        for (let i = 0; i < users.sessionID.length; i++) {
            if(users.sessionID[i] == socket.id) {
                users.sessionID.splice(i,1);
            }
        }
    });

});

app.get('/',(req, res) => {
    res.render("index");
});



