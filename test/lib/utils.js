"use strict";
const assert = require('assert');
const utils = require('../../lib/utils');
const dependencyCount = 24;

describe('utils', () => {
    describe('type checks', () => {
        it('should return true when it get a array', () => {
            assert(utils.isArray([]), "it didn't detect the array");
        });

        it('should return false when it get a string and not a array', () => {
            assert(utils.isArray("") === false, "it didn't detect the string");
        });

        it('should return true when it get a object', () => {
            assert(utils.isObject({}), "it didn't detect the object");
        });

        it('should return false when it get a string and not a object', () => {
            assert(utils.isObject("") === false, "it didn't detect the string");
        });
    });

    describe('get files', () => {
        it('should return a array of files in the inc folder, count is ' + dependencyCount, () => {
            utils.getAllFiles("../../inc").then((files) => {
                assert(files.length === dependencyCount, "it didn't get the right count of files");
            }).catch((err) => {
                throw err;
            });
        });

        it('should throw a error', () => {
            utils.getAllFiles("this is not a path").catch((err) => {
                assert(err, "no error");
            });
        });
    });
});
