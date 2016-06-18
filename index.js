"use strict";
const fs = require("fs");
const path = require("path");

const getArgs = (func) => {
    let args = (func + "")
        // strip single-line comments
        .replace(/[/][/].*$/mg, "")
        // strip white space
        .replace(/\s+/g, "")
        // strip multi-line comments
        .replace(/[/][*][^/*]*[*][/]/g, "")
        // extract the parameters
        .split("){", 1)[0].replace(/^[^(]*[(]/, "")
        // strip any ES6 defaults
        .replace(/=[^,]+/g, "");

    if (args[args.length - 1] === ")") {
        args = args.substr(0, args.length - 1);
    }
    // split & filter [""];
    return args.split(",").filter(Boolean);
};

const functionToString = (func) => {
    return func + "";
};

const isClass = (func) => {
    return functionToString(func).startsWith("class");
};

const isFunction = (func) => {
    return functionToString(func).startsWith("function");
};

const isArrow = (func) => {
    return functionToString(func).startsWith("(");
};


const isArray = (value) => {
    return Object.prototype.toString.call(value) === "[object Array]";
};
const isObject = (value) => {
    return value !== null && typeof value === "object";
};

class Depjector {

    constructor() {
        this.dependencies = [];
    }

    indexPath(dependencyPath) {
        dependencyPath += "";
        return new Promise((resolve, reject) => {
            fs.readdir(dependencyPath, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                let addedCount = 0;
                files.forEach((file) => {
                    const ext = path.extname(file);
                    if (ext === ".js") {
                        this.indexDependency(path.basename(file, path.extname(file)), path.normalize(path.join(__dirname, dependencyPath, file)));
                        addedCount += 1;
                    }
                });

                resolve(addedCount);
            });
        });
    }

    indexDependencies(dependencyArray) {
        if (!isArray(dependencyArray)) {
            throw new TypeError("dependencyArray isn't a array");
        }
        dependencyArray.forEach((dependency) => {
            this.indexDependency(dependency.name, dependency.path);
        });
    }

    indexDependency(name, path) {
        // force string.
        name += "";
        name = (name + "").charAt(0).toLowerCase() + name.slice(1);
        path = path + "";
        const dep = require(path);
        let service = {};
        let args = undefined;

        if (dep.__dependency) {
            if (dep.__dependency.name) {
                name = dep.__dependency.name + "";
            }
            if (dep.__dependency.service && isArray(dep.__dependency.service)) {
                service = dep.__dependency.service;
            }
            if (dep.__dependency.args) {
                args = dep.__dependency.args;
            }
        }

        this.dependencies.push({name, path, args, service, dep});
    }

    getDependency(name, overwrites) {
        // force string.
        name += "";
        overwrites = overwrites || {};

        let dep = undefined;
        this.dependencies.forEach((dependency) => {
            if (dependency.name === name) {
                dep = dependency;
            }
        });

        if (dep) {
            const output = dep.dep;
            const args = dep.args || getArgs(output);

            const params = [];
            if (args.length > 0) {
                args.forEach((arg) => {
                    if (overwrites[arg]) {
                        params.push(overwrites[arg]);
                    } else {
                        params.push(this.getDependency(arg));
                    }
                });
            }

            if (isClass(output)) {
                // make new object of the Class with the parameters
                return new (Function.prototype.bind.apply(output, [].concat([null], params)));
            } else if (isFunction(output) || isArrow(output)) {
                // call the function with the parameters
                return output.apply(undefined, params);
            }
            // if this is a object or simple type like string or number then return.
            return output;
        }
        return undefined;
    }

    executeService(serviceName) {
        if (!serviceName || serviceName.indexOf(":") === -1) {
            throw new Error("Format error.");
        }
        const funcArgs = Array.prototype.slice.call(arguments, 1);
        const deps = [];
        const methodName = serviceName.substr(serviceName.indexOf(":") + 1);

        this.dependencies.forEach((dependency) => {
            if (dependency.service && isArray(dependency.service) && dependency.service.indexOf(serviceName) > -1) {
                deps.push(dependency);
            }
        });

        if (deps.length > 0) {
            const results = [];
            deps.forEach((dep) => {

                const output = dep.dep;
                const args = dep.args || getArgs(output);


                const params = [];
                if (args.length > 0) {
                    args.forEach((arg) => {
                        params.push(this.getDependency(arg));
                    });
                }

                let obj = undefined;
                if (isClass(output)) {
                    // make new object of the Class with the parameters
                    obj = new (Function.prototype.bind.apply(output, [].concat([null], params)));
                } else if (isFunction(output) || isArrow(output)) {
                    // call the function with the parameters
                    obj = output.apply(undefined, params);
                } else {
                    obj = output;
                }

                if (obj && obj[methodName]) {
                    const result = obj[methodName].apply(obj, funcArgs);
                    if (result !== undefined) {
                        results.push(result);
                    }
                }
            });
            return results;
        }
        throw new Error("no services was found with the namespace:methodName provided");
    }
}

module.exports = Depjector;
