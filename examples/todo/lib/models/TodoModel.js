"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    created: {type: Date, default: Date.now},
    message: String,
    done: Boolean
});


module.exports = mongoose.model("todo", schema);

module.exports.__dependency = {
    finally: true
};
