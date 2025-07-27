type Primitives = {
  bigint: bigint;
  boolean: boolean;
  function: (...args: any[]) => any;
  number: number;
  object: object;
  string: string;
  symbol: symbol;
  undefined: undefined;
  null: null;
};
interface ObjectType {
  [key: string]: any;
}
type ClassType = abstract new (...args: any) => any;
type Class<C extends ClassType> = C extends new (...args: any) => infer T
  ? T
  : never;
type Key<O> = O extends ClassType ? keyof Class<O> : keyof O;

interface PropertyParams<O> {
  objectType: O;
  key: Key<O>;
  type:
    | keyof Primitives
    | Function
    | object
    | (keyof Primitives | Function | object)[];
  value: any;
  caller: Function;
  callerClass: Function;
}

class Property<O> {
  #objectType?: string;
  #key?: string;
  #type?: string;
  #value?: any;
  #valueType?: string;
  #valueConstructor?: string;
  #caller?: string;
  constructor(params?: Partial<PropertyParams<O>>) {
    this.objectType = params?.objectType;
    this.key = params?.key;
    this.type = params?.type;
    this.value = params?.value;
    this.caller = {
      caller: params?.caller,
      callerClass: params?.callerClass,
    };
  }
  set objectType(
    vlaue: Partial<PropertyParams<O>>["objectType"] | string | undefined
  ) {
    this.#objectType = this.#typeToString(vlaue);
  }
  get objectType() {
    return this.#objectType;
  }
  set key(value: Partial<PropertyParams<O>["key"]> | string | undefined) {
    this.#key = String(value);
  }
  get key(): string | undefined {
    return this.#key;
  }
  set type(value: Partial<PropertyParams<O>>["type"] | string | undefined) {
    this.#type =
      value instanceof Array
        ? value.map((v) => this.#typeToString(v)).join(" | ")
        : this.#typeToString(value);
  }
  get type() {
    return this.#type;
  }
  set value(value: any) {
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
  set caller(
    value:
      | Pick<Partial<PropertyParams<O>>, "caller" | "callerClass">
      | string
      | undefined
  ) {
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
  #typeToString(type: any): string {
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

export class PropertyTypeError<O> extends TypeError {
  #property?: Property<O>;
  constructor(property?: Partial<PropertyParams<O>>) {
    super();
    this.property = property;
  }
  set property(value: Partial<PropertyParams<O>> | Property<O> | undefined) {
    this.#property = value instanceof Property ? value : new Property(value);
    this.message = `Property '${this.#property.key}' in type '${
      this.#property.objectType
    }' must be of type '${this.#property.type}'\nFound: ${String(
      this.#property.value
    )}\nof type: '${this.#property.valueType}' and constructor: '${
      this.#property.valueConstructor
    }'`;
  }
  get property() {
    return this.#property;
  }
}

export class PropertyRequiredTypeError<O> extends TypeError {
  #property?: Property<O>;
  constructor(property?: Partial<PropertyParams<O>>) {
    super();
    this.property = property;
  }
  set property(value: Partial<PropertyParams<O>> | Property<O> | undefined) {
    this.#property = value instanceof Property ? value : new Property(value);
    this.message = `Property '${this.#property.key}' in type '${
      this.#property.objectType
    }' is '${String(this.#property.value)}' but is required in method '${
      this.#property.caller
    }'`;
  }
  get property() {
    return this.#property;
  }
}

export function isNonNullableProp<O, P>(
  value: P,
  objectType?: PropertyParams<O>["objectType"],
  key?: PropertyParams<O>["key"],
  caller?: PropertyParams<O>["caller"],
  callerClass?: PropertyParams<O>["callerClass"]
): value is NonNullable<P> {
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

export function isValueOfType<O, T extends keyof Primitives | ClassType>(
  value: any,
  types: T[],
  objectType?: PropertyParams<O>["objectType"],
  key?: PropertyParams<O>["key"],
  caller?: PropertyParams<O>["caller"],
  callerClass?: PropertyParams<O>["callerClass"]
): value is T extends keyof Primitives
  ? Primitives[T]
  : T extends ClassType
  ? Class<T>
  : never {
  function isValid(type: keyof Primitives | ClassType, value: any) {
    return typeof type === "string"
      ? typeof value === type
      : typeof type === "function"
      ? value.constructor.name === type.name
      : value === null || value === undefined;
  }
  const valid = types.some((t) => isValid(t, value));
  if (!valid)
    throw new PropertyRequiredTypeError({
      objectType: objectType,
      key: key,
      value: value,
      caller: caller,
      callerClass: callerClass,
    });
  return valid;
}

class MyClass {
  first: string;
  last: string;
  age: number;
  constructor(
    params: { f: string; l: string; a: number },
    options?: { encoding: string }
  ) {
    this.first = params.f;
    this.last = params.l;
    this.age = params.a;
  }
  full() {
    throw new PropertyTypeError({
      objectType: this as MyClass,
      key: "first",
      type: "string",
      value: 1234,
    });
  }
}

function doStuff(v: any) {
  if (!isValueOfType(v, [MyClass, "string", "boolean"])) return;
  v;
}
