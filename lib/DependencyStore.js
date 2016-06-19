"use strict";
const utils = require("./utils");

class DependencyStore {
    constructor() {
        this.dependencies = [];
    }

    add(dependency) {
        this.dependencies.push(dependency);
    }

    findOneByName(name) {
        return this.dependencies.find((dependency) => {
            if (dependency.name === name) {
                return dependency;
            }
        });
    }

    findAllByServiceName(serviceName) {
        const serviceDependencies = [];
        this.dependencies.forEach((dependency) => {
            if (dependency.service && utils.isArray(dependency.service) && dependency.service.indexOf(serviceName) > -1) {
                serviceDependencies.push(dependency);
            }
        });
        return serviceDependencies;
    }
}

module.exports = DependencyStore;
