"use strict";
const fs = require("fs");
const path = require("path");
const promisify = require("es6-promisify");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const self = module.exports = {
    isArray: (value) => {
        return Object.prototype.toString.call(value) === "[object Array]";
    },

    isObject: (value) => {
        return value !== null && typeof value === "object";
    },

    getAllFiles: (dir) => {
        return new Promise((resolve, reject) => {

            let results = [];
            readdir(dir).then((list) => {
                let pending = list.length;
                if (!pending) {
                    resolve(results);
                    return;
                }
                for (let file of list) {
                    file = path.resolve(dir, file);
                    stat(file).then((stat) => {
                        if (stat && stat.isDirectory()) {
                            self.getAllFiles(file).then((res) => {
                                results = results.concat(res);
                                if (!--pending) {
                                    resolve(results);
                                }
                            }).catch((err) => {
                                throw err;
                            });
                        } else {
                            results.push(file);
                            if (!--pending) {
                                resolve(results);
                            }
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
};