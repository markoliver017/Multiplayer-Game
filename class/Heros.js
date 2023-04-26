class Heros {
    constructor(socketID, numUsers) {
        this.character = "";
        this.id = socketID;
        this.position = {};
        this.bullets = [];
        this.score = 0;

        this.newPlayerConfig(numUsers);
    }

    newPlayerConfig(numUsers) {
        const characters = ['/images/hero1.png','/images/hero2.png','/images/hero3.png','/images/hero4.png','/images/hero5.png'];
        this.position = {x: numUsers * 200, y: 500 };
        this.character = characters[numUsers-1];
    }
}

module.exports = Heros;