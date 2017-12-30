export const expectAllEntries = (entries, toMatch) => {
    expect(entries.length).toBeGreaterThan(0);
    expect([toMatch]).toEqual(expect.arrayContaining(entries));
};

export const expectLastCallParameter = (fn, param) => {
    return expect(fn.mock.calls[fn.mock.calls.length - 1][param]);
};
