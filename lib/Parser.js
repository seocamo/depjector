"use strict";

const constructorLength = "constructor".length;
const functionLength = "function".length;
const try100Times = 100;

const indexOfAny = (str, arr, lastIndex) => {
    lastIndex = lastIndex || 0;
    const results = [];
    for (const item of arr) {
        results.push(str.indexOf(item, lastIndex));
    }
    let nr = Number.MAX_VALUE;
    let target = "";

    for (let index = 0; index < results.length; index += 1) {
        const item = results[index];
        if (item !== -1 && nr > item) {
            nr = item;
            target = arr[index];
        }
    }

    return {value: target, index: nr};
};

class Parser {
    constructor(dependency, argsIsKnown) {
        this.dependency = dependency;
        this.isClass = false;
        this.isFunction = false;
        this.isArrow = false;
        this.args = this._getArgs(dependency, argsIsKnown);
    }

    _getParameters(func, argsIsKnown) {
        // function (a, b) { OR class name { \n con(a, b) { OR (a, b) => {
        const str = func + "";
        let parentheses = 0;

        this.isClass = str.indexOf("class") === 0;
        this.isFunction = str.indexOf("function") === 0;
        this.isArrow = str.indexOf("(") === 0 && indexOfAny(str, ["=>", "\n"]).value === "=>";

        if (argsIsKnown) {
            return undefined;
        }
        // class function else arrow
        let index = this.isClass ? str.indexOf("(", str.indexOf("constructor") + constructorLength) : this.isFunction ? str.indexOf("(", functionLength) : this.isArrow ? 0 : -1;
        if (index === -1) {
            return "";
        }
        const startIndex = index;

        let cnt = 0;
        do {
            const curSet = indexOfAny(str, ["(", ")"], index);
            switch (curSet.value) {
                case "(":
                    parentheses += 1;
                    break;
                case ")":
                    parentheses -= 1;
                    break;
                // no default
            }
            index = curSet.index + 1;
            //if (parentheses === 0) {
            //    break;
            //}

            if (cnt === try100Times) {
                throw new Error("no end parents");
            }
            cnt += 1;
        }
        while (parentheses > 0);
        return str.substr(startIndex, index + 1);
    }

    _getArgs(func, argsIsKnown) {
        const fStr = this._getParameters(func, argsIsKnown);
        if (argsIsKnown) {
            return undefined;
        }
        if (fStr !== "") {
            let args = fStr
            // strip single-line comments
                .replace(/[/][/].*$/mg, "")
                // strip white space
                .replace(/\s+/g, "")
                // strip multi-line comments
                .replace(/[/][*][^/*]*[*][/]/g, "")
                // extract the parameters
                .split("){", 1)[0].replace(/^[^(]*[(]/, "")
            // strip any ES6 defaults
                .replace(/=[^,]+/g, "");

            if (args[args.length - 1] === ")") {
                args = args.substr(0, args.length - 1);
            }

            // split & filter [""];
            return args.split(",").filter(Boolean);
        }
        return [];
    }
}

module.exports = Parser;
