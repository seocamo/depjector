"use strict";

class UserCtrl {
    constructor(userModel) {
        this.userModel = userModel;
    }

    getAll() {
        return "Hallo from the UserCtrl";
    }
}


module.exports = UserCtrl;
