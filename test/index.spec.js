/* global jest, expect, describe, it */
import recursiveProxy from '../src/index';
import { expectLastCallParameter } from './helpers';

describe('Recursive Proxy', () => {
    it('handles invalid proxy target', () => {
        expect(() => {
            recursiveProxy(
                {
                    followFunction: false
                },
                function () {
                }
            );
        }).toThrow();

        expect(() => {
            recursiveProxy(
                {},
                []
            );
        }).toThrow();

        expect(() => {
            recursiveProxy(
                {},
                new Map
            );
        }).toThrow();
    });

    it('passes valid proxy target', () => {
        expect(recursiveProxy({}, function () {})).toBeTruthy();
        expect(recursiveProxy({ followArray: true }, [])).toBeTruthy();
        expect(recursiveProxy({ followNonPlainObject: true }, new Map)).toBeTruthy();
    });

    it('can do shallow value replace', () => {
        const proxy = recursiveProxy({
            value: {
                '.a': 5,
                '.c': 15
            }
        }, {
            a: 1
        });

        expect(proxy.a).toBe(5);
        expect(proxy.c).toBe(15);
        expect(proxy.b).toBeUndefined();
    });

    it('can do nested value replace', () => {
        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5,
                '.a.b.d': 7
            }
        }, {
            a: {
                b: {
                    c: 2,
                    d: 1
                }
            }
        });

        expect(proxy.a.b.c).toBe(5);
        expect(proxy.a.b.d).toBe(7);
        expect(proxy.b).toBeUndefined();
    });

    it('can do shallow value replace, not existing in target', () => {
        const proxy = recursiveProxy({
            value: {
                '.a': 5
            }
        }, {});

        expect(proxy.a).toBe(5);
        expect(proxy.b).toBeUndefined();
    });

    it('can do nested value replace, not existing in target', () => {
        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5
            }
        }, {
            a: {
                b: {}
            }
        });

        expect(proxy.a.b.c).toBe(5);
        expect(proxy.b).toBeUndefined();
    });

    it('can do nested value replace, always can enter', () => {
        const dummy = {};

        const proxy = recursiveProxy({
            value: {
                '.a.b.c': 5,
                '': dummy
            }
        }, {});

        expect(proxy.a.b.c).toBe(5);
        expect(Object.getPrototypeOf(proxy.b) === Object.getPrototypeOf({})).toBeTruthy();
        expect(Object.getPrototypeOf(proxy.b.a.d.f.g.h) === Object.getPrototypeOf({})).toBeTruthy();
    });

    it('can do nested value replace, always can enter, creator', () => {
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
        }, {});

        expect(proxy.a.b.c).toBe(10);
        expect(Object.getPrototypeOf(proxy.b) === Object.getPrototypeOf({})).toBeTruthy();
        expect(Object.getPrototypeOf(proxy.b.a.d.f.g.h) === Object.getPrototypeOf({})).toBeTruthy();
    });

    it('can do shallow value creator', () => {
        const proxy = recursiveProxy({
            creator: {
                '.a': (value) => 6 * value
            }
        }, {
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
        }, {
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
        }, {});

        expect(proxy.a).toBe(6);
        expect(proxy.b).toBeUndefined();
    });

    it('nested value creator, not existing in target', () => {
        const proxy = recursiveProxy({
            creator: {
                '.a.b.c': () => 7
            }
        }, {
            a: {
                b: {}
            }
        });

        expect(proxy.a.b.c).toBe(7);
        expect(proxy.b).toBeUndefined();
    });

    it('shallow read only, silent', () => {
        const proxy = recursiveProxy({
            readOnly: 'silent'
        }, {
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
        }, {
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
        }, {
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
        }, {
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

    it('value wildcard replace', () => {
        const proxy = recursiveProxy({
            value: {
                'c': 5,
                'f': 15
            }
        }, {
            a: {
                b: {
                    c: 2
                }
            }
        });

        expect(proxy.c).toBe(5);
        expect(proxy.a.c).toBe(5);
        expect(proxy.a.b.c).toBe(5);

        expect(proxy.f).toBe(15);
        expect(proxy.a.f).toBe(15);
        expect(proxy.a.b.f).toBe(15);

        expect(proxy.b).toBeUndefined();
    });

    it('wildcard value creator', () => {
        const proxy = recursiveProxy({
            creator: {
                'c': (value) => 10 * value
            }
        }, {
            a: {
                b: {
                    c: 2
                },
                c: 8
            },
            c: 4
        });

        expect(proxy.c).toBe(10 * 4);
        expect(proxy.a.c).toBe(10 * 8);
        expect(proxy.a.b.c).toBe(10 * 2);
        expect(proxy.b).toBeUndefined();
    });

    it('shallow value setter', () => {
        const proxy = recursiveProxy({
            setter: {
                '.a': (target, name, value) => {
                    target[name] = value * 2;
                    return true;
                }
            }
        }, {
            a: 1
        });

        expect(proxy.a).toBe(1);
        proxy.a = 3;
        expect(proxy.a).toBe(6);

        expect(proxy.b).toBeUndefined();
        proxy.b = 3;
        expect(proxy.b).toBe(3);
    });

    it('nested value setter', () => {
        const proxy = recursiveProxy({
            setter: {
                '.a.b.c': (target, name, value) => {
                    target[name] = value * 2;
                }
            }
        }, {
            a: {
                b: {
                    c: 2
                }
            }
        });

        expect(proxy.a.b.c).toBe(2);
        proxy.a.b.c = 5;
        expect(proxy.a.b.c).toBe(10);

        expect(proxy.b).toBeUndefined();
        proxy.b = 3;
        expect(proxy.b).toBe(3);
    });

    it('throwing value setter', () => {
        const proxy = recursiveProxy({
            setter: {
                '.a': () => {
                    return false;
                }
            }
        }, {
            a: 1
        });

        expect(proxy.a).toBe(1);
        expect(() => proxy.a = 3).toThrow();
    });

    it('wildcard value setter', () => {
        const proxy = recursiveProxy({
            setter: {
                'c': (target, name, value) => {
                    target[name] = value * 3;
                    return true;
                }
            }
        }, {
            a: {
                b: {
                    c: 2
                },
                c: 1
            }
        });

        expect(proxy.a.b.c).toBe(2);
        proxy.a.b.c = 5;
        expect(proxy.a.b.c).toBe(15);

        expect(proxy.a.c).toBe(1);
        proxy.a.c = 2;
        expect(proxy.a.c).toBe(6);

        expect(proxy.b).toBeUndefined();
        proxy.b = 3;
        expect(proxy.b).toBe(3);

        expect(proxy.c).toBeUndefined();
        proxy.c = 3;
        expect(proxy.c).toBe(9);
    });

    it('shallow apply', () => {
        const proxy = recursiveProxy({
            apply: {
                '': () => 10
            }
        }, function () {
        });

        expect(proxy()).toBe(10);
        expect(proxy.b).toBeUndefined();
    });

    it('nested apply', () => {
        const proxy = recursiveProxy({
            apply: {
                '.a.b.c': () => 10
            }
        }, {
            a: {
                b: {
                    c: function () {
                    },
                    x: function () {
                        return 'apud';
                    }
                }
            }
        });

        expect(proxy.a.b.c()).toBe(10);
        expect(proxy.a.b.x()).toBe('apud');
        expect(proxy.b).toBeUndefined();
    });

    it('wildcard apply', () => {
        const proxy = recursiveProxy({
            apply: {
                'c': () => 10
            }
        }, {
            c: function () {
            },
            a: {
                c: function () {
                },
                b: {
                    c: function () {
                    },
                    x: function () {
                        return 'apud';
                    }
                }
            }
        });

        expect(proxy.c()).toBe(10);
        expect(proxy.a.c()).toBe(10);
        expect(proxy.a.b.c()).toBe(10);
        expect(proxy.a.b.x()).toBe('apud');
        expect(proxy.b).toBeUndefined();
    });

    it('shallow construct', () => {
        const expectedResult = { u: 'la-la-la' };

        const proxy = recursiveProxy({
            construct: {
                '': () => expectedResult
            }
        }, function () {
        });

        expect(new proxy).toBe(expectedResult);
        expect(proxy.b).toBeUndefined();
    });

    it('nested construct', () => {
        const expectedResult = { i: 'love you baby' };
        const unexpectedResult = { u: 'la-la-la' };

        const proxy = recursiveProxy({
            construct: {
                '.a.b.c': () => expectedResult
            }
        }, {
            a: {
                b: {
                    c: function () {
                    },
                    x: function () {
                        return unexpectedResult;
                    }
                }
            }
        });

        expect(new proxy.a.b.c).toBe(expectedResult);
        expect(new proxy.a.b.x).toBe(unexpectedResult);
        expect(proxy.b).toBeUndefined();
    });

    it('wildcard construct', () => {
        const expectedResult = { u: 'la-la-la' };
        const unexpectedResult = { i: 'love you baby' };

        const proxy = recursiveProxy({
            construct: {
                'c': () => expectedResult
            }
        }, {
            c: function () {
            },
            a: {
                c: function () {
                },
                b: {
                    c: function () {
                    },
                    x: function () {
                        return unexpectedResult;
                    }
                }
            }
        });

        expect(new proxy.c).toBe(expectedResult);
        expect(new proxy.a.c).toBe(expectedResult);
        expect(new proxy.a.b.c).toBe(expectedResult);
        expect(proxy.a.b.x()).toBe(unexpectedResult);
        expect(proxy.b).toBeUndefined();
    });

    it('calls traps with correct arguments', () => {
        const context = {};

        const target = {
            a: 3,
            b: function () {},
            c: function () {},
            d: 0
        };

        const mock = {
            a: jest.fn().mockReturnValue(true),
            b: jest.fn().mockReturnValue(true),
            c: jest.fn().mockReturnValue({}),
            d: jest.fn().mockReturnValue(true)
        };

        const proxy = recursiveProxy({
            creator: {
                '.a': mock.a
            },
            apply: {
                '.b': mock.b
            },
            construct: {
                '.c': mock.c
            },
            setter: {
                '.d': mock.d
            }
        }, target, context);

        expect(proxy.a).toBeTruthy();
        expect(mock.a).toBeCalledWith(3, target, 'a', ['a']);
        expect(mock.a.mock.instances[0]).toBe(context);

        const args = ['arg1', 2, {}];
        expect(proxy.b(...args)).toBeTruthy();
        expectLastCallParameter(mock.b, 0).toBe(target.b);
        expectLastCallParameter(mock.b, 2).toEqual(expect.arrayContaining(args));
        expectLastCallParameter(mock.b, 3).toEqual(expect.arrayContaining(['b']));
        expect(mock.b.mock.instances[0]).toBe(context);

        const args2 = ['arg1wqe', 2343242, {}, []];
        expect(new proxy.c(...args2)).toBeTruthy();
        expectLastCallParameter(mock.c, 0).toBe(target.c);
        expectLastCallParameter(mock.c, 1).toEqual(expect.arrayContaining(args2));
        expectLastCallParameter(mock.c, 3).toEqual(expect.arrayContaining(['c']));
        expect(mock.c.mock.instances[0]).toBe(context);

        proxy.d = 123;
        expect(mock.d).toBeCalledWith(target, 'd', 123, ['d']);
        expect(mock.d.mock.instances[0]).toBe(context);
    });
});
