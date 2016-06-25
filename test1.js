/*eslint no-console: 0*/
"use strict";
const ts = Date.now();
const Depjector = require("./index");

const depjector = new Depjector();

depjector.indexPath("./inc").then((count) => {
    const ts0 = Date.now();
    console.log(count);

    depjector.executeService("routes:public", {
        count: 0, add: () => {
            this.count += 1;
        }
    }).then((results) => {
        console.log(results);


        const ts1 = Date.now();
        depjector.getDependency("otherMod").then((otherMod) => {
            const ts2 = Date.now();
            console.log("OtherMod", otherMod, func, arrow);
            otherMod.callMe();
            depjector.getDependency("func").then((func) => {
                const ts3 = Date.now();
                depjector.getDependency("arrow").then((arrow) => {
                    const ts4 = Date.now();
                    depjector.getDependency("otherMod").then((otherMod1) => {
                        depjector.getDependency("func1").then((func1) => {
                            const done = Date.now();
                            console.log(ts0 - ts, done - ts1, done - ts2, done - ts3, done - ts4, Date.now() - ts);
                        });
                    });
                });
            });
        });
    });
}).catch((err) => {
    console.log(err.toString());
});
