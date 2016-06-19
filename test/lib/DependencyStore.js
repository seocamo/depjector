"use strict";
const assert = require('assert');
const DependencyStore = require('../../lib/DependencyStore');

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
            dependencyStore.add({name: "test"});
            assert(dependencyStore.dependencies[0].name === "test", "it did't added the test object");
        });

        it('should find one object', () => {
            const dependencyStore = new DependencyStore();
            dependencyStore.add({name: "test"});
            assert(dependencyStore.findOneByName("test").name === "test", "it did't added the test object");
        });

        it('should find all by a service name', () => {
            const dependencyStore = new DependencyStore();
            dependencyStore.add({name: "test", service: ["some:test"]});
            assert(dependencyStore.findAllByServiceName("some:test")[0].name === "test", "it did't added the test object");
        });
    });
});
