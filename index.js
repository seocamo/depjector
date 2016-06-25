"use strict";
const path = require("path");
const utils = require("./lib/utils");
const DependencyStore = require("./lib/DependencyStore");

class Depjector {

    constructor() {
        this.dependencyStore = new DependencyStore();
    }

    indexPath(dependencyPath) {
        dependencyPath += "";
        return new Promise((resolve, reject) => {
            utils.getAllFiles(dependencyPath).then((files) => {
                let addedCount = 0;
                let error;
                files.every((file) => {
                    const ext = path.extname(file);
                    if (ext === ".js") {
                        this.indexDependency(file).then(() => {
                            addedCount += 1;
                        }).catch((e) => {
                            if (!error) {
                                // start with the first error...
                                error = e;
                            }
                        });
                    }
                    if (error) {
                        reject(error);
                        return false;
                    }
                    return true;
                });
                if (error) {
                    return reject(error);
                }
                return resolve(addedCount);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    indexDependencies(dependencyArray) {
        return new Promise((resolve, reject) => {
            if (!utils.isArray(dependencyArray)) {
                reject(new TypeError("dependencyArray isn't a array"));
            }
            dependencyArray.forEach((dependency) => {
                this.indexDependency(dependency);
            });
            resolve();
        });
    }

    indexDependency(dependency) {
        return new Promise((resolve, reject) => {
            try {
                this.dependencyStore.add(dependency);
            } catch (e) {
                return reject(e);
            }
            return resolve();
        });
    }

    getDependency(name, overwrites) {
        return new Promise((resolve, reject) => {
            try {
                // force string.
                name += "";

                const dependency = this.dependencyStore.findOneByName(name);

                if (dependency) {
                    resolve(this._injectDependency(dependency, overwrites));
                    return;
                }
                resolve(undefined);
            } catch (e) {
                reject(e);
            }
        });
    }

    executeService(serviceName) {
        return new Promise((resolve, reject) => {
            if (!serviceName || serviceName.indexOf(":") === -1) {
                reject(new Error("Format error."));
            }

            const serviceDependencies = this.dependencyStore.findAllByServiceName(serviceName);

            if (serviceDependencies.length > 0) {
                const results = [];
                const methodName = serviceName.substr(serviceName.indexOf(":") + 1);
                serviceDependencies.forEach((dependency) => {
                    const instance = this._injectDependency(dependency);

                    if (instance && instance[methodName]) {
                        const funcArgs = Array.prototype.slice.call(arguments, 1);
                        const result = instance[methodName].apply(instance, funcArgs);
                        if (result !== undefined) {
                            results.push(result);
                        }
                    }
                });
                resolve(results);
            }
            reject(new Error("no services was found"));
        });
    }


    /**
     * _injectDependency
     * @param {Dependency} dependency
     * @param {Object} overwrites
     * @returns {Object}
     */
    _injectDependency(dependency, overwrites) {
        // if the user don't want DI on a module jump over.
        if (dependency.finally) {
            return dependency.dependency;
        }

        overwrites = overwrites || {};

        // make a parameter list with the dependencies.
        const params = [];
        if (dependency.args.length > 0) {
            dependency.args.forEach((arg) => {
                if (overwrites[arg]) {
                    params.push(overwrites[arg]);
                } else {
                    this.getDependency(arg).then((dep) => {
                        params.push(dep);

                    }).catch((e) => {
                        throw e;
                    });
                }
            });
        }

        if (dependency.isClass) {
            // make new object of the Class with the parameters
            return new (Function.prototype.bind.apply(dependency.dependency, [].concat([null], params)));
        } else if (dependency.isFunction || dependency.isArrow) {
            // call the function with the parameters
            return dependency.dependency.apply(undefined, params);
        }
        // if this is a object or simple type like string or number then return.
        return dependency.dependency;
    }
}

module.exports = Depjector;
