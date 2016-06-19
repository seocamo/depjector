/*eslint no-console: 0*/
"use strict";
const Depjector = require("../../index");
const express = require("express");
const app = express();
const depjector = new Depjector();
const devPort = 3000;

depjector.indexPath("./lib").then((count) => {
    console.log(count + " dependencies loaded");

    depjector.executeService("routes:public", app);

    app.listen(devPort, () => {
        console.log("Example todo app listening on port 3000!");
    });
}).catch((err) => {
    console.log(err);
});
