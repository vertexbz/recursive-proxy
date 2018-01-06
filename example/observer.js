import Multimap from 'multimap';

import RProxy from '../src';

const observable = (subject, notifyParents = false) => {
    const _subscribers = new Multimap();

    return new RProxy({
        value: {
            '.subscribe': (key, callback) => {
                _subscribers.set(key, callback);

                return () => {
                    _subscribers.delete(key, callback)
                }
            }
        },
        setter: {
            '': (target, key, value, path) => {
                const oldValue = target[key];
                if (oldValue !== value) {
                    target[key] = value;

                    const fullPath = path.join('.');

                    do {
                        const matchedSubscribers = _subscribers.get(path.join('.'));
                        if (matchedSubscribers) {
                            matchedSubscribers.forEach((callback) => {
                                return callback({ from: oldValue, to: value }, { target, key, origin: subject, path: fullPath });
                            });
                        }
                    } while (notifyParents && (path = path.slice(0, -1)).length > 0);
                }
            }
        }
    }, subject)
};

const target = {
    a: {
        b: {
            c: {
                d: 9
            }
        }
    }
};

const proxy = observable(target, true);
proxy.subscribe('a.b.c.d', ({ from, to }, { key }) => console.log(`Sub1. Value changed from ${from} to ${to} at key ${key}.`));
proxy.subscribe('a.b.c', ({ from, to }, { key, origin, path }) => {
    console.log(`Sub2. Nested value changed from ${from} to ${to} at key ${key}, in object`, target);
    console.log('Sub2. Observed object', origin, `, path ${path}`);
});

console.log(target.a.b.c.d); //9
console.log(proxy.a.b.c.d); //9

proxy.a.b.c.d = 11;
// Sub1. Value changed from 9 to 11 at key d.
// Sub2. Nested value changed from 9 to 11 at key d, in object { a: { b: { c: [Object] } } }
// Sub2. Observed object { a: { b: { c: [Object] } } } , path a.b.c.d


console.log(proxy.a.b.c.d); //11
console.log(target.a.b.c.d); //11

proxy.a.b.c.e = 22;
// Sub2. Nested value changed from undefined to 22 at key e, in object { a: { b: { c: [Object] } } }
// Sub2. Observed object { a: { b: { c: [Object] } } } , path a.b.c.e


console.log(proxy.a.b.c); // { d: 11, e: 22 }
console.log(target.a.b.c); // { d: 11, e: 22 }
