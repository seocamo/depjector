/*eslint no-console: 0*/
"use strict";
const ts = Date.now();
const Depjector = require("./index");

const depjector = new Depjector();

const now = Date.now();

depjector.addNodeModules(["babel-cli", "babel-preset-es2015", "babel-register"]).then((count) => {
    console.log("N ", (Date.now() - now), " ");
    console.log(count);
});

const now1 = Date.now();

depjector.addModules([
    "grunt-mocha-test",
    "isparta",
    "istanbul",
    "mocha"
]).then((count) => {
    console.log("M ", (Date.now() - now1), " ");
    console.log(count);
});


depjector.indexPath("./inc").then((count) => {
    const ts0 = Date.now();
    console.log(count);

    const results = depjector.executeService("routes:public", {
        count: 0, add: () => {
            this.count += 1;
        }
    });
    console.log(results);


    const ts1 = Date.now();
    const otherMod = depjector.getDependency("otherMod");
    const ts2 = Date.now();
    const func = depjector.getDependency("func");
    const ts3 = Date.now();
    const arrow = depjector.getDependency("arrow");
    const ts4 = Date.now();
    const otherMod1 = depjector.getDependency("otherMod1");
    const func1 = depjector.getDependency("func1");
    const done = Date.now();
    console.log("OtherMod", otherMod, func, arrow);
    otherMod.callMe();

    console.log(ts0 - ts, done - ts1, done - ts2, done - ts3, done - ts4, Date.now() - ts);
}).catch((err) => {
    console.log(err.toString());
});
