import {
  PropertyTypeError,
  PropertyRequiredTypeError,
  isNonNullableProp,
  isValueOfType,
} from ".";

class MyClass {
  #first?: string;
  #last?: string;
  #age?: number;
  constructor(params?: { first?: string; last?: string; age?: number }) {
    this.first = params?.first;
    this.last = params?.last;
    this.age = params?.age;
  }
  set first(value: string | undefined) {
    if (!isValueOfType(value, ["string", "undefined"], MyClass, "first"))
      return;
    this.#first = value;
  }
  get first() {
    return this.#first;
  }
  set last(value: string | undefined) {
    if (!isValueOfType(value, ["string", "undefined"], MyClass, "last")) return;
    this.#last = value;
  }
  get last() {
    return this.#last;
  }
  set age(value: number | undefined) {
    if (!isValueOfType(value, ["number", "undefined"], MyClass, "age")) return;
    this.#age = value;
  }
  get age() {
    return this.#age;
  }
}

// @ts-expect-error
const mc = new MyClass({ first: 235 });
