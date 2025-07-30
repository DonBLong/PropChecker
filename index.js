"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRequiredTypeError = exports.PropertyTypeError = void 0;
exports.isNonNullableProp = isNonNullableProp;
exports.isValueOfType = isValueOfType;
class Property {
    #objectType;
    #key;
    #type;
    #valueFound;
    #caller;
    constructor(params) {
        this.objectType = params?.objectType;
        this.key = params?.key;
        this.type = params?.type;
        this.valueFound = params?.value;
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
    set valueFound(value) {
        this.#valueFound = {
            value: value,
            type: typeof value,
            constructor: value.constructor.name,
        };
    }
    get valueFound() {
        return this.#valueFound;
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
class PropertyTypeError extends TypeError {
    #property;
    valueFound;
    constructor(property) {
        super();
        this.property = property;
    }
    set property(value) {
        this.#property = value instanceof Property ? value : new Property(value);
        this.message = `Property '${this.#property.key}' in type '${this.#property.objectType}' must be of type '${this.#property.type}'`;
        this.valueFound = this.#property.valueFound;
    }
    get property() {
        return this.#property;
    }
}
exports.PropertyTypeError = PropertyTypeError;
class PropertyRequiredTypeError extends TypeError {
    #property;
    constructor(property) {
        super();
        this.property = property;
    }
    set property(value) {
        this.#property = value instanceof Property ? value : new Property(value);
        this.message = `Property '${this.#property.key}' in type '${this.#property.objectType}' is '${String(this.#property.valueFound?.value)}' but is required in method '${this.#property.caller}'`;
    }
    get property() {
        return this.#property;
    }
}
exports.PropertyRequiredTypeError = PropertyRequiredTypeError;
function isNonNullableProp(value, objectType, key, caller, callerClass) {
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
function isValueOfType(value, types, objectType, key) {
    function isValid(type) {
        return typeof type === "string"
            ? typeof value === type
            : typeof type === "function"
                ? value.constructor.name === type.name
                : value === null || value === undefined;
    }
    const typesArray = types instanceof Array ? types : [types];
    if (!typesArray.some(isValid))
        throw new PropertyTypeError({
            objectType: objectType,
            key: key,
            type: types,
            value: value,
        });
    return true;
}
