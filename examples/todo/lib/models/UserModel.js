"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    created: {type: Date, default: Date.now},
    userName: String,
    password: String
});


module.exports = mongoose.model("user", schema);

module.exports.__dependency = {
    finally: true
};
