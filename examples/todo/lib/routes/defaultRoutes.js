"use strict";

module.exports = () => {
    return {
        public: (app) => {
            app.get("/", (req, res) => {
                res.send("Hello world!");
            });
        }
    };
};

module.exports.__dependency = {service: ["routes:public"]};
