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
        const builtPath = pathBuilder(ctx.config.pathSeparator, ctx.path);

        let value = matchObjectPath(ctx.config.value, builtPath, name);

        if (value === undefined) {
            value = target[name];
        }

        const creator = matchObjectPath(ctx.config.creator, builtPath, name);
        if (creator) {
            value = creator.call(ctx.context, value, target, name, ctx.path);
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
            return setter.call(ctx.context, target, name, value, ctx.path) !== false;
        }

        target[name] = value;
        return true;
    },
    apply(target: Function, thisArg: any, argArray: ?Array<any>): any {
        const path = this.path;

        const apply = matchObjectPath(this.config.apply, pathBuilder(this.config.pathSeparator, path), getLastPathElement(path));
        if (apply) {
            return apply.call(this.context, target, thisArg, argArray, path);
        }

        return Function.prototype.apply.call(target, thisArg, (argArray: any));
    },
    construct(target: Function, argArray: Array<any>, newTarget?: any): Object {
        const path = this.path;

        const construct = matchObjectPath(
            this.config.construct,
            pathBuilder(this.config.pathSeparator, path),
            getLastPathElement(path)
        );

        if (construct) {
            return construct.call(this.context, target, argArray, newTarget, path);
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
