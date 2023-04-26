
class Users {
    constructor(socketID, hero) {
        this.user = {};
        this.gameServer = socketID;
        this.sessionID = [];
        this.newUser(socketID, hero);
    }

    newUser(socketID, hero) {
        this.user[socketID] = hero;
        this.sessionID.push(socketID);
        return this.user[socketID];
    }

}
module.exports = Users;