// @flow
const nope = () => {
    throw new Error('The object is read only!');
};

const shh = (): * => true;

export const readOnlyTrapsMixin = {
    set: nope,
    defineProperty: nope,
    deleteProperty: nope,
    preventExtensions: nope,
    setPrototypeOf: nope
};

export const silentReadOnlyTrapsMixin = {
    set: shh,
    defineProperty: shh,
    deleteProperty: shh,
    preventExtensions: shh,
    setPrototypeOf: shh
};
