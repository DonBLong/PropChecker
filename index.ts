interface PrimitiveTypes {
  bigint: bigint;
  boolean: boolean;
  function: (...args: any[]) => any;
  number: number;
  object: object;
  string: string;
  symbol: symbol;
  undefined: undefined;
  null: null;
}
type Constructor = abstract new (...args: any) => any;
type Class<C> = C extends abstract new (...args: any) => infer T ? T : never;
type Key<O> = O extends Constructor ? keyof Class<O> : keyof O;
type Type = keyof PrimitiveTypes | Constructor | object;
type Value<T> = T extends keyof PrimitiveTypes
  ? PrimitiveTypes[T]
  : T extends Constructor
  ? Class<T>
  : T extends object
  ? T
  : never;

interface PropertyParams<O> {
  objectType: O;
  key: Key<O>;
  type: Type | Type[];
  value: any;
  caller: Function;
  callerClass: Function;
}
interface ValueFound {
  value: any;
  type: keyof PrimitiveTypes;
  constructor: string;
}

class Property<O> {
  #objectType?: string;
  #key?: string;
  #type?: string;
  #valueFound?: ValueFound;
  #caller?: string;
  constructor(params?: Partial<PropertyParams<O>>) {
    this.objectType = params?.objectType;
    this.key = params?.key;
    this.type = params?.type;
    this.valueFound = params?.value;
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
  set valueFound(value: PropertyParams<O>["value"]) {
    this.#valueFound = {
      value: value,
      type: typeof value,
      constructor: value.constructor.name,
    };
  }
  get valueFound(): ValueFound | undefined {
    return this.#valueFound;
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
  valueFound?: Property<O>["valueFound"];
  constructor(property?: Partial<PropertyParams<O>>) {
    super();
    this.property = property;
  }
  set property(value: Partial<PropertyParams<O>> | Property<O> | undefined) {
    this.#property = value instanceof Property ? value : new Property(value);
    this.message = `Property '${this.#property.key}' in type '${
      this.#property.objectType
    }' must be of type '${this.#property.type}'`;
    this.valueFound = this.#property.valueFound;
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
    }' is '${String(
      this.#property.valueFound?.value
    )}' but is required in method '${this.#property.caller}'`;
  }
  get property() {
    return this.#property;
  }
}

export function isNonNullableProp<O, P>(
  value: P,
  objectType: PropertyParams<O>["objectType"],
  key: PropertyParams<O>["key"],
  caller: PropertyParams<O>["caller"],
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

export function isValueOfType<O, T extends Type>(
  value: any,
  types: T | T[],
  objectType: PropertyParams<O>["objectType"],
  key: PropertyParams<O>["key"]
): value is Value<T> {
  function isValid(type: T) {
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
