"use strict";
const ts = Date.now();
const Depjector = require('./index');

const depjector = new Depjector();

depjector.indexPath('./test').then((count) => {
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

    console.log('OtherMod', otherMod, func, arrow);
    otherMod.callMe();
    console.log((ts0 - ts), (done - ts1), (done - ts2), (done - ts3), (done - ts4), (Date.now() - ts));
}).catch((err) => {
    console.log(err);
});
