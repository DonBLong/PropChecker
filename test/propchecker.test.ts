import { describe, test, expect } from "vitest";
import {
  isNonNullable,
  isOfType,
  PropertyRequiredTypeError,
  PropertyTypeError,
} from "../src/propchecker";

describe(isNonNullable, () => {
  test(`It returns true if the value is non-nullable and returns false or throws a ${PropertyRequiredTypeError.name} if the value is nullable`, () => {
    const obj = {
      firstName: "Kyle",
      lastName: undefined,
      address: null,
    };

    expect(isNonNullable(obj.firstName)).toBeTruthy();
    expect(isNonNullable(obj.lastName)).toBeFalsy();
    expect(isNonNullable(obj.address)).toBeFalsy();

    function useObjFirstname(objParam: typeof obj) {
      if (
        isNonNullable(objParam.firstName, {
          objectType: objParam,
          key: "firstName",
          caller: useObjFirstname,
        })
      )
        return objParam.firstName;
    }

    function useObjLastname(objParam: typeof obj) {
      if (
        isNonNullable(objParam.lastName, {
          objectType: objParam,
          key: "lastName",
          caller: useObjLastname,
        })
      )
        return objParam.lastName;
    }

    function useObjAddress(objParam: typeof obj) {
      if (
        isNonNullable(objParam.address, {
          objectType: objParam,
          key: "address",
          caller: useObjAddress,
        })
      )
        return objParam.address;
    }

    expect(useObjFirstname(obj)).toBe("Kyle");
    expect(() => useObjLastname(obj)).toThrowError(PropertyRequiredTypeError);
    expect(() => useObjAddress(obj)).toThrowError(PropertyRequiredTypeError);
  });
});
