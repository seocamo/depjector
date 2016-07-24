'use strict';
class OtherMod {
    constructor(someMod, depjector, accessToken) {
        console.log('Creating OtherMod');
        this.someMod = someMod;
        this.depjector = depjector;
        this.accessToken = accessToken;
    }

    callMe() {
        this.depjector.updateDependency(this.accessToken, (someMod, depjector, accessToken) => {
            console.log("upd", someMod, accessToken);
        });
        this.someMod.callMe();
    }
}

module.exports = OtherMod;
