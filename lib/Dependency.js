"use strict";
const path = require("path");
const Parser = require("./Parser");
const utils = require("./utils");

class Dependency {
    constructor(options) {
        if (typeof options === "string") {
            options = {path: options};
        }
        options = Object.assign({
            finally: false
        }, options);
        this.name = options.name;
        this.path = options.path;
        this.service = options.service;
        this.args = options.args;
        this.finally = options.finally;

        // User, Module, Filename as name
        //Move all parser to this, also check on __depend service
        //If create class with string then the str is use as path else it need a object options here the path is the only req
        //Type check on args from module if array then make it to a obj
        //If service is not a array then debug log it

        this.dependency = require(this.path);

        if (this.dependency.__dependency) {
            // if not user define then try the module
            if (!this.name && this.dependency.__dependency.name) {
                this.name = this.dependency.__dependency.name + "";
            }
            if (!this.service && this.dependency.__dependency.service && utils.isArray(this.dependency.__dependency.service)) {
                this.service = this.dependency.__dependency.service;
            }
            if (!this.args && this.dependency.__dependency.args) {
                this.args = this.dependency.__dependency.args;
            }
            if (!this.finally && this.dependency.__dependency.finally === true) {
                this.finally = true;
            }
        }

        if (!this.name) {
            //if not user and module define then use filename
            this.name = path.basename(this.path, path.extname(this.path));
        }
        this.name = (this.name + "").charAt(0).toLowerCase() + this.name.slice(1);


        // if the user don't want DI on a module jump over.
        if (!this.finally) {
            // parser the dependency getting the args for detect its dependencies.
            const parser = new Parser(this.dependency, !!this.args);
            this.isClass = parser.isClass;
            this.isFunction = parser.isFunction;
            this.isArrow = parser.isArrow;
            if (!this.args) {
                this.args = parser.args;
            }
        }
    }
}

/*
 Promise
 */

module.exports = Dependency;
