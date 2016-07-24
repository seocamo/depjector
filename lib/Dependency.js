"use strict";
const path = require("path");
const Parser = require("./Parser");
const utils = require("./utils");

class Dependency {
    constructor(options) {
        try {
            if (typeof options === "string") {
                options = {path: options};
            }
            //instantiate: true
            options = Object.assign({
                autowired: true
            }, options);
            this.name = options.name;
            this.path = options.path;
            this.service = options.service;
            this.args = options.args;
            this.autowired = options.autowired;
            this.instance = options.instance;

            // User, Module, Filename as name
            //Move all parser to this, also check on __depend service
            //If create class with string then the str is use as path else it need a object options here the path is the only req
            //Type check on args from module if array then make it to a obj
            //If service is not a array then debug log it
            if (!this.instance && !this.path) {
                throw new Error("no path to make a instance was pass in and no instance was pass in");
            }

            this.instance = this.instance || require(this.path);

            if (this.instance.__dependency) {
                // if not user define then try the module
                if (!this.name && this.instance.__dependency.name) {
                    this.name = this.instance.__dependency.name + "";
                }
                if (!this.service && this.instance.__dependency.service && utils.isArray(this.instance.__dependency.service)) {
                    this.service = this.instance.__dependency.service;
                }
                if (!this.args && this.instance.__dependency.args) {
                    this.args = this.instance.__dependency.args;
                }
                if (this.instance.__dependency.autowired === true || this.instance.__dependency.autowired === false) {
                    this.autowired = this.instance.__dependency.autowired;
                }
            }

            if (!this.name) {
                //if not user and module define then use filename
                this.name = path.basename(this.path, path.extname(this.path));
            }


            // if the user don't want DI on a module jump over.
            if (this.autowired) {
                // if using DI, then we make a object of classes the name need to be camelcase
                this.name = (this.name + "").charAt(0).toLowerCase() + this.name.slice(1);
                // parser the dependency getting the args for detect its dependencies.
                const parser = new Parser(this.instance, !!this.args);
                this.isClass = parser.isClass;
                this.isFunction = parser.isFunction;
                this.isArrow = parser.isArrow;
                if (!this.args) {
                    this.args = parser.args;
                }
            }
            this.accessToken = Symbol(this.name);
        } catch (e) {
            throw new Error(`can't parser ${JSON.stringify(options)} ${e.message}`);
        }
    }
}

/*
 Promise
 */

module.exports = Dependency;
