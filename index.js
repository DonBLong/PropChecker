const primitiveTypes = [
    "bigint",
    "boolean",
    "function",
    "number",
    "object",
    "string",
    "symbol",
    "undefined",
];
class Property {
    #objectType;
    #key;
    #type;
    #value;
    #valueType;
    #valueConstructor;
    #caller;
    constructor(params) {
        this.objectType = params?.objectType;
        this.key = params?.key;
        this.type = params?.type;
        this.value = params?.value;
        this.caller = {
            caller: params?.caller,
            callerClass: params?.callerClass,
        };
    }
    set objectType(vlaue) {
        this.#objectType = this.#typeToString(vlaue);
    }
    get objectType() {
        return this.#objectType;
    }
    set key(value) {
        this.#key = String(value);
    }
    get key() {
        return this.#key;
    }
    set type(value) {
        this.#type =
            value instanceof Array
                ? value.map((v) => this.#typeToString(v)).join(" | ")
                : this.#typeToString(value);
    }
    get type() {
        return this.#type;
    }
    set value(value) {
        this.#value = value;
        this.#valueType = typeof value;
        this.#valueConstructor = value?.constructor.name;
    }
    get value() {
        return this.#value;
    }
    get valueType() {
        return this.#valueType;
    }
    get valueConstructor() {
        return this.#valueConstructor;
    }
    set caller(value) {
        this.#caller =
            typeof value === "string"
                ? value
                : typeof value?.callerClass === "function"
                    ? `${value?.callerClass.name}.${value?.caller?.name}`
                    : value?.caller?.name;
    }
    get caller() {
        return this.#caller;
    }
    #typeToString(type) {
        return typeof type === "string"
            ? type
            : typeof type === "function"
                ? type.name
                : typeof type === "object"
                    ? type.constructor.name === "Object"
                        ? JSON.stringify(type)
                        : type.constructor.name
                    : String(type);
    }
}
export class PropertyTypeError extends TypeError {
    #property;
    constructor(property) {
        super();
        this.property = property;
    }
    set property(value) {
        this.#property = value instanceof Property ? value : new Property(value);
        this.message = `Property '${this.#property.key}' in type '${this.#property.objectType}' must be of type '${this.#property.type}'\nFound: ${String(this.#property.value)}\nof type: '${this.#property.valueType}' and constructor: '${this.#property.valueConstructor}'`;
    }
    get property() {
        return this.#property;
    }
}
export class PropertyRequiredTypeError extends TypeError {
    #property;
    constructor(property) {
        super();
        this.property = property;
    }
    set property(value) {
        this.#property = value instanceof Property ? value : new Property(value);
        this.message = `Property '${this.#property.key}' in type '${this.#property.objectType}' is '${String(this.#property.value)}' but is required in method '${this.#property.caller}'`;
    }
    get property() {
        return this.#property;
    }
}
export function isNonNullableProp(value, objectType, key, caller, callerClass) {
    if (value === undefined || value === null)
        throw new PropertyRequiredTypeError({
            objectType: objectType,
            key: key,
            value: value,
            caller: caller,
            callerClass: callerClass,
        });
    return true;
}
class MyClass {
    first;
    last;
    age;
    constructor(params, options) {
        this.first = params.f;
        this.last = params.l;
        this.age = params.a;
    }
    full() {
        throw new PropertyTypeError({
            objectType: this,
            key: "first",
            type: "string",
            value: 1234,
        });
    }
}
