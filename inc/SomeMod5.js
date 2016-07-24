'use strict';
class SomeMod5 {
    constructor(someMod3) {
        console.log('Creating SomeMode5');
    }

    callMe() {
        console.log('show me some thing');
    }
}

module.exports = SomeMod5;

module.exports.__dependency = {
    name: 'SomeMod5',
    service: [],
    args: [],
    autowired: false
};
