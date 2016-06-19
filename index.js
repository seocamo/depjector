"use strict";
const path = require("path");
const utils = require("./lib/utils");
const DependencyStore = require("./lib/DependencyStore");
const Parser = require("./lib/Parser");

class Depjector {

    constructor() {
        this.dependencyStore = new DependencyStore();
    }

    indexPath(dependencyPath) {
        dependencyPath += "";
        return new Promise((resolve, reject) => {
            utils.getAllFiles(dependencyPath).then((files) => {
                let addedCount = 0;
                files.forEach((file) => {
                    const ext = path.extname(file);
                    if (ext === ".js") {
                        this.indexDependency(path.basename(file, path.extname(file)), file);
                        addedCount += 1;
                    }
                });

                resolve(addedCount);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    indexDependencies(dependencyArray) {
        if (!utils.isArray(dependencyArray)) {
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
        let isFinally = false;

        if (dep.__dependency) {
            if (dep.__dependency.name) {
                name = dep.__dependency.name + "";
            }
            if (dep.__dependency.service && utils.isArray(dep.__dependency.service)) {
                service = dep.__dependency.service;
            }
            if (dep.__dependency.args) {
                args = dep.__dependency.args;
            }
            if (dep.__dependency.finally === true) {
                isFinally = true;
            }

        }

        this.dependencyStore.add({name, path, args, service, finally: isFinally, dep});
    }

    getDependency(name, overwrites) {
        // force string.
        name += "";

        const dependency = this.dependencyStore.findOneByName(name);

        if (dependency) {
            return this._injectDependency(dependency, overwrites);
        }
        return undefined;
    }

    executeService(serviceName) {
        if (!serviceName || serviceName.indexOf(":") === -1) {
            throw new Error("Format error.");
        }

        const serviceDependencies = this.dependencyStore.findAllByServiceName(serviceName);

        if (serviceDependencies.length > 0) {
            const results = [];
            serviceDependencies.forEach((dependency) => {

                const instance = this._injectDependency(dependency);
                const methodName = serviceName.substr(serviceName.indexOf(":") + 1);

                if (instance && instance[methodName]) {
                    const funcArgs = Array.prototype.slice.call(arguments, 1);
                    const result = instance[methodName].apply(instance, funcArgs);
                    if (result !== undefined) {
                        results.push(result);
                    }
                }
            });
            return results;
        }
        throw new Error("no services was found");
    }


    _injectDependency(dependency, overwrites) {
        // if the user don't want DI on a module jump over.
        if (dependency.finally) {
            return dependency.dep;
        }
        // parser the dependency getting the args for detect its dependencies.
        const parser = new Parser(dependency.dep);

        const args = dependency.args || parser.args;
        overwrites = overwrites || {};

        // make a parameter list with the dependencies.
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

        if (parser.isClass) {
            // make new object of the Class with the parameters
            return new (Function.prototype.bind.apply(parser.dependency, [].concat([null], params)));
        } else if (parser.isFunction || parser.isArrow) {
            // call the function with the parameters
            return parser.dependency.apply(undefined, params);
        }
        // if this is a object or simple type like string or number then return.
        return parser.dependency;
    }
}

module.exports = Depjector;
