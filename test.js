"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class MyClass {
    #first;
    #last;
    #age;
    constructor(params) {
        this.first = params?.first;
        this.last = params?.last;
        this.age = params?.age;
    }
    set first(value) {
        if (!(0, _1.isValueOfType)(value, ["string", "undefined"], MyClass, "first"))
            return;
        this.#first = value;
    }
    get first() {
        return this.#first;
    }
    set last(value) {
        if (!(0, _1.isValueOfType)(value, ["string", "undefined"], MyClass, "last"))
            return;
        this.#last = value;
    }
    get last() {
        return this.#last;
    }
    set age(value) {
        if (!(0, _1.isValueOfType)(value, ["number", "undefined"], MyClass, "age"))
            return;
        this.#age = value;
    }
    get age() {
        return this.#age;
    }
}
// @ts-expect-error
const mc = new MyClass({ first: 235 });
