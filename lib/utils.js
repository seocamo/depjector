"use strict";
const fs = require("fs");
const path = require("path");

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
            fs.readdir(dir, (err, list) => {
                if (err) {
                    reject(err);
                    return;
                }
                let pending = list.length;
                if (!pending) {
                    resolve(results);
                    return;
                }
                for (let file of list) {
                    file = path.resolve(dir, file);
                    fs.stat(file, (err, stat) => {
                        if (err) {
                            reject(err);
                            return;
                        }
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
                    });
                }
            });
        });
    }
};