/* global expect */
export const expectLastCallParameter = (fn, param) => {
    return expect(fn.mock.calls[fn.mock.calls.length - 1][param]);
};
