"use strict";
const path = require("path");
const fs = require("fs");
const utils = require("./lib/utils");
const DependencyStore = require("./lib/DependencyStore");

const snakeToCamel = (string) => {
    //const now = Date.now();
    const out = string.replace(/(\-\w)/g, (m) => {
        return m[1].toUpperCase();
    });
    //console.log("t ", (Date.now() - now), "\n");
    return out;
};

class Depjector {

    constructor() {
        this.dependencyStore = new DependencyStore();
        this.indexDependency({name: "depjector", dependency: this, final: true});
    }

    indexPath(dependencyPath) {
        dependencyPath += "";
        //const now = Date.now();
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
                //console.log("p ", (Date.now() - now), "\n");
                return resolve(this.dependencyStore.dependencies.length - before);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    addNodeModules(filter) {
        filter = filter || [];
        //const now = Date.now();
        return new Promise((resolve, reject) => {
            fs.readdir("./node_modules", (err, files) => {
                if (err) {
                    reject(err);
                }
                let count = 0;
                //console.log("oo ", (Date.now() - now), "\n");
                const now1 = Date.now();
                for (const file of files) {
                    if (file[0] !== "." && filter.indexOf(file) === -1) {
                        this.indexDependency({name: snakeToCamel(file), path: file, finally: true});
                        count += 1;
                    }
                }
                //console.log("ii ", (Date.now() - now1), "\n");
                //console.log("n ", (Date.now() - now), "\n");
                resolve(count);
            });
        });
    }

    addModules(nameArray) {
        const args = [];
        //const now = Date.now();
        for (const name of nameArray) {
            args.push({name: snakeToCamel(name), path: name, finally: true});
        }
        //console.log("m ", (Date.now() - now), "\n");
        return this.indexDependencies(args);
    }

    indexDependencies(dependencyArray) {
        //const now = Date.now();
        return new Promise((resolve, reject) => {
            if (!utils.isArray(dependencyArray)) {
                reject(new TypeError("dependencyArray isn't a array"));
            }
            for (const dependency of dependencyArray) {
                this.indexDependency(dependency);
            }
            //console.log("2 ", (Date.now() - now), "\n");
            resolve();
        });
    }

    indexDependency(dependency) {
        //const now = Date.now();
        return new Promise((resolve, reject) => {
            try {
                this.dependencyStore.add(dependency);
            } catch (e) {
                return reject(e);
            }
            //console.log("d ", (Date.now() - now), "\n");
            return resolve();
        });
    }

    setDependency(name, dependency) {
        this.dependencyStore.set(name, dependency);
    }

    udateDependency(accessToken, cb) {
        const dependency = this.dependencyStore.findOneByAccessToken(accessToken);
        if (dependency) {
            this._injectDependency(dependency, {}, cb);
        }
    }

    getDependency(name, overwrites) {
        // force string.
        name += "";

        //const now = Date.now();
        const dependency = this.dependencyStore.findOneByName(name);

        const result = dependency ? this._injectDependency(dependency, overwrites) : undefined;
        //console.log("g ", (Date.now() - now), "\n");
        return result;
    }

    executeService(serviceName) {
        //const now = Date.now();
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
            //console.log("e ", (Date.now() - now), "\n");
            return results;
        }
        throw new Error("no services was found");
    }


    /**
     * _injectDependency
     * @param {Dependency} dependency
     * @param {Object} overwrites
     * @param {Function} cb
     * @returns {Object}
     */
    _injectDependency(dependency, overwrites, cb) {
        //const now = Date.now();
        // if the user don't want DI on a module jump over.
        if (dependency.finally) {
            //console.log("i ", (Date.now() - now), "\n");
            return dependency.dependency;
        }

        overwrites = overwrites || {};

        // make a parameter list with the dependencies.
        const params = [];
        if (dependency.args.length > 0) {
            for (const arg of dependency.args) {
                if (arg === "accessToken") {
                    params.push(dependency.accessToken);
                } else if (overwrites[arg]) {
                    params.push(overwrites[arg]);
                } else {
                    params.push(this.getDependency(arg));
                }
            }
        }

        if (cb) {
            return cb.apply(undefined, params);
        } else if (dependency.isClass) {
            // make new object of the Class with the parameters
            //console.log("i ", (Date.now() - now), "\n");
            return new (Function.prototype.bind.apply(dependency.dependency, [].concat([null], params)));
        } else if (dependency.isFunction || dependency.isArrow) {
            // call the function with the parameters
            //console.log("i ", (Date.now() - now), "\n");
            return dependency.dependency.apply(undefined, params);
        }
        // if this is a object or simple type like string or number then return.
        //console.log("i ", (Date.now() - now), "\n");
        return dependency.dependency;
    }
}

module.exports = Depjector;
