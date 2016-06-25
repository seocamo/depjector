"use strict";
const assert = require('assert');
const DependencyStore = require('../../lib/DependencyStore');
const path = require("path");

class testClass {
    constructor() {
        constructor.log('done');
    }
}

describe('dependencyStore', () => {
    describe('basic tests', () => {
        it('should create a dependencyStore object', () => {
            const dependencyStore = new DependencyStore();
            assert(dependencyStore, "it didn't create the object");
        });

        it('should add a test object to the store', () => {
            const dependencyStore = new DependencyStore();
            dependencyStore.add(path.resolve(__dirname, "./../../inc/arrow.js"));
            assert(dependencyStore.dependencies[0].name === "arrow", "it did't added the test object");
        });

        it('should find one object', () => {
            const dependencyStore = new DependencyStore();
            dependencyStore.add(path.resolve(__dirname, "./../../inc/arrow.js"));
            assert(dependencyStore.findOneByName("arrow").name === "arrow", "it did't added the test object");
        });

        it('should find all by a service name', () => {
            const dependencyStore = new DependencyStore();
            dependencyStore.add(path.resolve(__dirname, "./../../inc/func3.js"));
            assert(dependencyStore.findAllByServiceName("routes:public")[0].name === "func3", "it did't added the test object");
        });
    });
});
