"use strict";
const assert = require('assert');
const Depjector = require('../index');
const dependencyCount = 24;

describe('Depjector', () => {
    describe('basic tests', () => {
        it('should create a object of Depjector without throws', () => {
            const depjector = new Depjector();
            assert(depjector !== undefined, "it is not a object");
        });

        it("should load all " + dependencyCount + " dependencies", () => {
            const depjector = new Depjector();
            depjector.indexPath("../inc").then((count) => {
                assert(count === dependencyCount, "it didn't load all dependencies");
            }).catch((err) => {
                throw err;
            });

        });

        it("should add 2 dependencies extra", () => {
            const depjector = new Depjector();
            depjector.indexDependencies([
                {name: "test1", path: "./inc/OtherMod.js"},
                {name: "test2", path: "./inc/OtherMod1.js"}
            ]).then(() => {
                assert(depjector.dependencyStore.dependencies.length === 2, "it didn't load 2 dependencies");
            });
        });

        it("should throw a error if get any thing else then a array", () => {
            const depjector = new Depjector();
            try {
                depjector.indexDependencies("");
            } catch (e) {
                assert(e, "it didn't catch a error");
            }
        });

        it("should add a dependency", () => {
            const depjector = new Depjector();
            depjector.indexDependency({name: "test1", path: "./inc/SomeMod5.js"}).then(() => {
                assert(depjector.dependencyStore.dependencies.length === 1, "it didn't load a dependency");
            });
        });

        it("should get a dependency", () => {
            const depjector = new Depjector();
            depjector.indexDependency("../inc/SomeMod5.js");

            assert(depjector.getDependency("someMod5", {}), "it didn't get a dependency");
        });

        it('should load OtherMod', function () {
            const ts = Date.now();
            const depjector = new Depjector();
            depjector.indexPath('../inc').then((count) => {
                const ts0 = Date.now();
                console.log(count);

                console.log(depjector.executeService('routes:public', {count: 0, add:function() { this.count++; }}));
                const ts1 = Date.now();
                const otherMod = depjector.getDependency('otherMod');
                const ts2 = Date.now();
                const func = depjector.getDependency('func');
                const ts3 = Date.now();
                const arrow = depjector.getDependency('arrow');
                const ts4 = Date.now();
                const otherMod1 = depjector.getDependency('otherMod');
                const done = Date.now();
                const func1 = depjector.getDependency('func1');

                otherMod.callMe();
                assert(true, (ts0 - ts) + " " + (done - ts1) + " " + (done - ts2) + " " + (done - ts3) + " " + (done - ts4) + " " + (Date.now() - ts));
                assert(otherMod, "OtherMod is not loaded");
            }).catch((err) => {
                throw err;
            });

        });
    });
});
