"use strict";
const assert = require('assert');
const Parser = require('../../lib/Parser');

class testClass {
    constructor() {
        constructor.log('done');
    }
}

describe('parser', function() {
    describe('basic tests', function () {
        it('should create a parser object', () => {
            const parser = new Parser(testClass);
            assert(parser, "it didn't create the object");
        });
    });
});
