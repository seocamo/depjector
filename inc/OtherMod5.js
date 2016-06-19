'use strict';
class OtherMod5 {
    constructor(someMod5) {
        console.log('Creating OtherMod5');
        this.someMod = someMod5;
    }

    callMe() {
        this.someMod.callMe();
    }
}

module.exports = OtherMod5;
