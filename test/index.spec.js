/* global jest, expect, describe, it */
import recursiveProxy from '../src/index';

describe('Recursive Proxy', () => {
    it('shallow value replace', () => {
        const proxy = recursiveProxy({
            value: {
                '.a': 5
            }
        })({
            a: 1
        });

        expect(proxy.a).toBe(5);
        expect(proxy.b).toBeUndefined();
    });

    it('nested value replace', () => {
        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5
            }
        })({
            a: {
                b: {
                    c: 2
                }
            }
        });

        expect(proxy.a.b.c).toBe(5);
        expect(proxy.b).toBeUndefined();
    });

    it('shallow value replace, not existing in target', () => {
        const proxy = recursiveProxy({
            value: {
                '.a': 5
            }
        })({});

        expect(proxy.a).toBe(5);
        expect(proxy.b).toBeUndefined();
    });

    it('nested value replace, not existing in target', () => {
        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5
            }
        })({
            a: {
                b: {

                }
            }
        });

        expect(proxy.a.b.c).toBe(5);
        expect(proxy.b).toBeUndefined();
    });

    it('nested value replace, always can enter', () => {
        const dummy = {};

        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5,
                '': dummy
            }
        })({});

        expect(proxy.a.b.c).toBe(5);
        expect(Object.getPrototypeOf(proxy.b) === Object.getPrototypeOf({})).toBeTruthy();
        expect(Object.getPrototypeOf(proxy.b.a.d.f.g.h) === Object.getPrototypeOf({})).toBeTruthy();
    });

    it('nested value replace, always can enter, creator', () => {
        const dummy = {};

        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5,
                '': dummy
            },
            creator: {
                '': (value) => {
                    if (typeof value === 'number') {
                        return value * 2;
                    }

                    return value;
                }
            }
        })({});

        expect(proxy.a.b.c).toBe(10);
        expect(Object.getPrototypeOf(proxy.b) === Object.getPrototypeOf({})).toBeTruthy();
        expect(Object.getPrototypeOf(proxy.b.a.d.f.g.h) === Object.getPrototypeOf({})).toBeTruthy();
    });

    it('shallow value creator', () => {
        const proxy = recursiveProxy({
            creator: {
                '.a': (value) => 6 * value
            }
        })({
            a: 3
        });

        expect(proxy.a).toBe(3 * 6);
        expect(proxy.b).toBeUndefined();
    });

    it('nested value creator', () => {
        const proxy = recursiveProxy({
            creator: {
                '.a.b.c': (value) => 6 * value
            }
        })({
            a: {
                b: {
                    c: 2
                }
            }
        });

        expect(proxy.a.b.c).toBe(6 * 2);
        expect(proxy.b).toBeUndefined();
    });

    it('shallow value creator, not existing in target', () => {
        const proxy = recursiveProxy({
            creator: {
                '.a': () => 6
            }
        })({});

        expect(proxy.a).toBe(6);
        expect(proxy.b).toBeUndefined();
    });

    it('nested value creator, not existing in target', () => {
        const proxy = recursiveProxy({
            creator: {
                '.a.b.c': () => 7
            }
        })({
            a: {
                b: {

                }
            }
        });

        expect(proxy.a.b.c).toBe(7);
        expect(proxy.b).toBeUndefined();
    });

    it('shallow read only, silent', () => {
        const proxy = recursiveProxy({
            readOnly: 'silent'
        })({
            a: 1
        });

        expect(proxy.a).toBe(1);
        expect(proxy.b).toBeUndefined();

        proxy.a = 2;
        proxy.b = 3;

        expect(proxy.a).toBe(1);
        expect(proxy.b).toBeUndefined();
    });

    it('shallow read only, error', () => {
        const proxy = recursiveProxy({
            readOnly: 'error'
        })({
            a: 1
        });

        expect(proxy.a).toBe(1);
        expect(proxy.b).toBeUndefined();

        expect(() => {
            proxy.a = 2;
        }).toThrow();

        expect(() => {
            proxy.b = 3;
        }).toThrow();

        expect(proxy.a).toBe(1);
        expect(proxy.b).toBeUndefined();
    });

    it('nested read only, silent', () => {
        const proxy = recursiveProxy({
            readOnly: 'silent'
        })({
            a: {
                b: {
                    c: 2
                }
            }
        });

        expect(proxy.a.b.c).toBe(2);
        expect(proxy.b).toBeUndefined();

        proxy.a.b.c = 3;
        proxy.b = 4;

        expect(proxy.a.b.c).toBe(2);
        expect(proxy.b).toBeUndefined();
    });

    it('nested read only, error', () => {
        const proxy = recursiveProxy({
            readOnly: 'error'
        })({
            a: {
                b: {
                    c: 2
                }
            }
        });

        expect(proxy.a.b.c).toBe(2);
        expect(proxy.b).toBeUndefined();

        expect(() => {
            proxy.a.b.c = 3;
        }).toThrow();

        expect(() => {
            proxy.b = 3;
        }).toThrow();

        expect(proxy.a.b.c).toBe(2);
        expect(proxy.b).toBeUndefined();
    });
});
