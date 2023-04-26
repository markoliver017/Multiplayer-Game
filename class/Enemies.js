class Enemies {
    constructor() {
        this.defaultEnemies = [
            { x: 0, y: 0, backgroundPosition: "-6px -5px", status: 0},
            { x: 0, y: 0, backgroundPosition: "-30px -10px", status: 0},
            { x: 0, y: 0, backgroundPosition: "-60px -10px", status: 0},
            { x: 0, y: 0, backgroundPosition: "-90px -5px", status: 0},
            { x: 0, y: 0, backgroundPosition: "-118px -5px", status: 0},
            { x: 0, y: 0, backgroundPosition: "-150px -5px", status: 0},
            { x: 0, y: 0, backgroundPosition: "-185px -5px", status: 0}
        ];
    }

    shuffleEnemyPosition(newEnemy = this.defaultEnemies){
        for (let i = 0; i < newEnemy.length; i++) {
            newEnemy[i].y = 0;
            newEnemy[i].x = Math.random()*(650) + 10;
        }
        return newEnemy;
    }
}

module.exports = new Enemies;