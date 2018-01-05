// @flow
import contextProxy from 'context-proxy';
import { getLastPathElement, matchObjectPath, nope, pathBuilder, shh, shouldFollowValue, triageSet } from './utils';

import type { RecursiveContext } from './types';

const enhanceContext = <C, O, T, N>(context: RecursiveContext<C, O, *, N>, target: T, path: string): RecursiveContext<C, O, T, N> => ({
    config: context.config,
    context: context.context,
    origin: context.origin,
    traps: context.traps,
    path: context.path.concat(String(path)),
    target
});

const traps = {
    get(target: Object, name: string): mixed {
        const ctx = enhanceContext(this, target, name);

        let value = matchObjectPath(ctx.config.value, pathBuilder(ctx.config.pathSeparator, ctx.path), name);

        if (value === undefined) {
            value = target[name];
        }

        const creator = matchObjectPath(ctx.config.creator, pathBuilder(ctx.config.pathSeparator, ctx.path), name);
        if (creator) {
            value = creator.call(ctx.context, value, target, name);
        }

        if (shouldFollowValue(value, ctx.config)) {
            return contextProxy(value, ctx.traps, ctx);
        }

        return value;
    },
    set(target: Object, name: string, value: any): boolean {
        const ctx = enhanceContext(this, target, name);

        const setter = matchObjectPath(ctx.config.setter, pathBuilder(ctx.config.pathSeparator, ctx.path), name);
        if (setter) {
            return setter.call(ctx.context, target, name, value) !== false;
        }

        target[name] = value;
        return true;
    },
    apply(target: Function, thisArg: any, argArray?: any): any {
        const apply = matchObjectPath(this.config.apply, pathBuilder(this.config.pathSeparator, this.path), getLastPathElement(this.path));
        if (apply) {
            return apply.call(this.context, target, thisArg, argArray);
        }

        return Function.prototype.apply.call(target, thisArg, (argArray: any));
    },
    construct(target: Function, argArray: any, newTarget?: any): Object {
        const construct = matchObjectPath(
            this.config.construct,
            pathBuilder(this.config.pathSeparator, this.path),
            getLastPathElement(this.path)
        );

        if (construct) {
            return construct.call(this.context, target, argArray, newTarget);
        }

        return new target(...argArray);
    }
};

const readOnlyTrapsMixin = {
    set: nope,
    defineProperty: nope,
    deleteProperty: nope,
    preventExtensions: nope,
    setPrototypeOf: nope
};

const silentReadOnlyTrapsMixin = {
    set: shh,
    defineProperty: shh,
    deleteProperty: shh,
    preventExtensions: shh,
    setPrototypeOf: shh
};


export const triageTraps = triageSet({
    error: Object.assign({}, traps, readOnlyTrapsMixin),
    silent: Object.assign({}, traps, silentReadOnlyTrapsMixin)
}, traps);

export default triageTraps;
