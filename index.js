"use strict";
const path = require("path");
const fs = require("fs");
const utils = require("./lib/utils");
const DependencyStore = require("./lib/DependencyStore");
const promisify = require("es6-promisify");
const readdir = promisify(fs.readdir);

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
        this.addDependency({name: "depjector", instance: this, autowired: false});
    }

    addByPath(dependencyPath) {
        dependencyPath += "";
        //const now = Date.now();
        return new Promise((resolve, reject) => {
            const before = this.dependencyStore.dependencies.length;
            utils.getAllFiles(dependencyPath).then((files) => {
                files.every((file) => {
                    const ext = path.extname(file);
                    if (ext === ".js") {
                        this.addDependency(file).then(() => {
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
            readdir("./node_modules").then((files) => {
                let count = 0;
                //console.log("oo ", (Date.now() - now), "\n");
                const now1 = Date.now();
                for (const file of files) {
                    if (file[0] !== "." && filter.indexOf(file) === -1) {
                        this.addDependency({name: snakeToCamel(file), path: file, autowired: false});
                        count += 1;
                    }
                }
                //console.log("ii ", (Date.now() - now1), "\n");
                //console.log("n ", (Date.now() - now), "\n");
                resolve(count);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    addModuleList(nameArray) {
        const args = [];
        //const now = Date.now();
        for (const name of nameArray) {
            args.push({name: snakeToCamel(name), path: name, autowired: false});
        }
        //console.log("m ", (Date.now() - now), "\n");
        return this.addDependencies(args);
    }

    addDependencies(dependencyArray) {
        //const now = Date.now();
        return new Promise((resolve, reject) => {
            if (!utils.isArray(dependencyArray)) {
                reject(new TypeError("dependencyArray isn't a array"));
            }
            for (const dependency of dependencyArray) {
                this.addDependency(dependency);
            }
            //console.log("2 ", (Date.now() - now), "\n");
            resolve();
        });
    }

    addDependency(dependency) {
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

    addPath(name, path) {
        return this.addDependency({
            name,
            path,
            autowired: false
        });
    }

    addInstance(name, instance) {
        return this.addDependency({
            name,
            instance,
            autowired: false
        });
    }

    setDependency(name, dependency) {
        this.dependencyStore.set(name, dependency);
    }

    updateDependency(accessToken, cb) {
        const dependency = this.dependencyStore.findOneByAccessToken(accessToken);
        if (dependency) {
            this._injectDependency(dependency, {}, [], cb);
        }
    }

    getDependency(name, overwrites) {
        return this._getDependency(name, overwrites, []);
    }

    _getDependency(name, overwrites, parentNames) {
        // force string.
        name += "";

        const newParentNames = parentNames.slice();
        newParentNames.push(name);

        //const now = Date.now();
        const dependency = this.dependencyStore.findOneByName(name);

        const result = dependency ? this._injectDependency(dependency, overwrites, newParentNames) : undefined;
        //console.log("g ", (Date.now() - now), "\n");
        return result;
    }

    removeDependency(name) {
        // force string.
        name += "";

        this.dependencyStore.removeByName(name);
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
     * @param {Array} parentNames
     * @param {Function} cb
     * @returns {Object}
     */
    _injectDependency(dependency, overwrites, parentNames, cb) {
        //const now = Date.now();
        // if the user don't want DI on a module jump over.
        if (!dependency.autowired) {
            //console.log("i ", (Date.now() - now), "\n");
            return dependency.instance;
        }

        overwrites = overwrites || {};
        parentNames = parentNames || [];

        // make a parameter list with the dependencies.
        const params = [];
        if (dependency.args.length > 0) {
            for (const arg of dependency.args) {
                if (parentNames.indexOf(arg) > -1) {
                    throw new Error(`dependency ${arg} can't depend on it self`);
                } else if (arg === "accessToken") {
                    params.push(dependency.accessToken);
                } else if (overwrites[arg]) {
                    params.push(overwrites[arg]);
                } else {
                    params.push(this._getDependency(arg, undefined, parentNames));
                }
            }
        }

        if (cb) {
            return cb.apply(undefined, params);
        } else if (dependency.isClass) {
            // make new object of the Class with the parameters
            //console.log("i ", (Date.now() - now), "\n");
            return new (Function.prototype.bind.apply(dependency.instance, [].concat([null], params)));
        } else if (dependency.isFunction || dependency.isArrow) {
            // call the function with the parameters
            //console.log("i ", (Date.now() - now), "\n");
            return dependency.instance.apply(undefined, params);
        }
        // if this is a object or simple type like string or number then return.
        //console.log("i ", (Date.now() - now), "\n");
        return dependency.instance;
    }
}

module.exports = Depjector;
