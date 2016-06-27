"use strict";
const utils = require("./utils");
const Dependency = require("./Dependency");

class DependencyStore {
    constructor() {
        this.dependencies = [];
    }

    add(dependency) {
        this.dependencies.push(new Dependency(dependency));
    }

    set(name, dependency) {
        this.dependencies.find((element, index) => {
            if (element.name === name) {
                this.dependencies[index] = new Dependency(dependency);
                return false;
            }
            return true;
        });
    }

    findOneByName(name) {
        return this.dependencies.find((dependency) => {
            if (dependency.name === name) {
                return dependency;
            }
            return undefined;
        });
    }

    findAllByServiceName(serviceName) {
        const serviceDependencies = [];
        for (const dependency of this.dependencies) {
            if (dependency.service && utils.isArray(dependency.service) && dependency.service.indexOf(serviceName) > -1) {
                serviceDependencies.push(dependency);
            }
        }
        return serviceDependencies;
    }
}

module.exports = DependencyStore;
