"use strict";

class TodoCtrl {
    constructor(todoModel) {
        this.todoModel = todoModel;
    }

    getAll() {
        return "Hallo from the TodoCtrl" + this.todoModel.toString();
    }
}


module.exports = TodoCtrl;
