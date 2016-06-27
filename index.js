"use strict";
const path = require("path");
const fs = require("fs");
const utils = require("./lib/utils");
const DependencyStore = require("./lib/DependencyStore");

const snakeToCamel = (string) => {
    const now = Date.now();
    const out = string.replace(/(\-\w)/g, (m) => {
        return m[1].toUpperCase();
    });
    console.log(" ", (Date.now() - now), " ");
    return out;
};

class Depjector {

    constructor() {
        this.dependencyStore = new DependencyStore();
        this.indexDependency({name: "depjector", dependency: this, final: true});
    }

    indexPath(dependencyPath) {
        dependencyPath += "";
        return new Promise((resolve, reject) => {
            const before = this.dependencyStore.dependencies.length;
            utils.getAllFiles(dependencyPath).then((files) => {
                files.every((file) => {
                    const ext = path.extname(file);
                    if (ext === ".js") {
                        this.indexDependency(file).then(() => {
                        }).catch((e) => {
                            reject(e);
                        });
                    }
                    return true;
                });
                return resolve(this.dependencyStore.dependencies.length - before);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    addNodeModules(filter) {
        filter = filter || [];
        return new Promise((resolve, reject) => {
            fs.readdir("./node_modules", (err, files) => {
                if (err) {
                    reject(err);
                }
                let count = 0;
                for (const file of files) {
                    if (file[0] !== "." && filter.indexOf(file) === -1) {
                        this.indexDependency({name: snakeToCamel(file), path: file, final: true});
                        count += 1;
                    }
                }
                resolve(count);
            });
        });
    }

    addModules(nameArray) {
        const args = [];
        for (const name of nameArray) {
            args.push({name: snakeToCamel(name), path: name, final: true});
        }
        return this.indexDependencies(args);
    }

    indexDependencies(dependencyArray) {
        return new Promise((resolve, reject) => {
            if (!utils.isArray(dependencyArray)) {
                reject(new TypeError("dependencyArray isn't a array"));
            }
            for (const dependency of dependencyArray) {
                this.indexDependency(dependency);
            }
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

    setDependency(name, dependency) {
        this.dependencyStore.set(name, dependency);
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
            const methodName = serviceName.substr(serviceName.indexOf(":") + 1);
            for (const dependency of serviceDependencies) {
                const instance = this._injectDependency(dependency);

                if (instance && instance[methodName]) {
                    const funcArgs = Array.prototype.slice.call(arguments, 1);
                    results.push(instance[methodName].apply(instance, funcArgs));
                }
            }
            return results;
        }
        throw new Error("no services was found");
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
            for (const arg of dependency.args) {
                if (overwrites[arg]) {
                    params.push(overwrites[arg]);
                } else {
                    params.push(this.getDependency(arg));
                }
            }
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
