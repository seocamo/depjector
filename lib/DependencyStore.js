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
        dependency.name = name;
        const result = this.dependencies.find((element, index) => {
            if (element.name === name) {
                this.dependencies[index] = new Dependency(dependency);
                return true;
            }
            return false;
        });
        if (!result) {
            this.add(dependency);
        }
    }

    findOneByName(name) {
        return this.dependencies.find((dependency) => {
            if (dependency.name === name) {
                return dependency;
            }
            return undefined;
        });
    }

    findOneByAccessToken(accessToken) {
        return this.dependencies.find((dependency) => {
            if (dependency.accessToken === accessToken) {
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

    removeByName(name) {
        const index = this.dependencies.indexOf(name);

        if (index > -1) {
            this.dependencies.slice(index, 1);
        }
    }
}

module.exports = DependencyStore;
