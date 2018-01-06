import RProxy from '../src';

const _gets = (obj, path, defaultValue) => {
    if (path.length === 0) {
        return obj;
    }

    const key = path.shift();
    if (key in obj) {
        return _gets(obj[key], path, defaultValue);
    }

    return defaultValue;
};

const gets = (subject) => new RProxy({
    value: {
        '':  () => {}
    },
    apply: {
        '': (_, __, [defaultValue], path) => {
            return _gets(subject, path, defaultValue);
        }
    }
}, subject);

const target = {
    a: {
        b: {
            c: {
                d: 9876789
            }
        },
        k: () => 'existing func result'
    }
};


const proxy = gets(target);

console.log(proxy.a.b.c({})); // { d: 9876789 }
console.log(proxy.a.b.c.d(0)); // 9876789
console.log(proxy.a.b.c.e(0)); // 0

console.log(proxy.a.b.z({})); // {}
target.a.b.z = { now: 7 };
console.log(proxy.a.b.z({})); // { now: 7 }

console.log(proxy.x.y.z.e('!default!')); // !default!
console.log(proxy.x.y.z.f()); // undefined


// functions
const fallbackFunc = () => 'fallback func result';

const func1 = proxy.a.k(fallbackFunc);
console.log(func1()); // existing func result


const func2 = proxy.a.l(fallbackFunc);
console.log(func2()); // fallback func result
