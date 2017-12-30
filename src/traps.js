// @flow
import contextProxy from 'context-proxy';
import { matchObjectPath, pathBuilder, triageSet } from './utils';
import { readOnlyTrapsMixin, silentReadOnlyTrapsMixin } from './readOnly';

import type { RecursiveContext } from './types';

const enhanceContext = <C, O, T, N>(context: RecursiveContext<C, O, *, N>, target: T, path: string): RecursiveContext<C, O, T, N> => ({
    config: context.config,
    context: context.context,
    origin: context.origin,
    traps: context.traps,
    path: path ? context.path.concat(String(path)) : context.path,
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

        if (typeof value === 'object' || typeof value === 'function') {
            return contextProxy(value, ctx.traps, ctx);
        }

        return value;
    },
    set(target: Object, name: string, value: any): boolean {
        const ctx = enhanceContext(this, target, name);

        const setter = matchObjectPath(ctx.config.creator, pathBuilder(ctx.config.pathSeparator, ctx.path), name);
        if (setter) {
            return setter.call(ctx.context, target, name, value);
        }

        try {
            target[name] = value;
            return true;
        } catch (e) {
            return false;
        }
    },
    apply(target: Function, thisArg: any, argArray?: any): any {
        const apply = matchObjectPath(this.config.apply, pathBuilder(this.config.pathSeparator, this.path), '');
        if (apply) {
            return apply.call(this.context, target, thisArg, argArray);
        }

        return Function.prototype.apply.call(target, thisArg, argArray || []);
    },
    construct(target: Function, argArray: any, newTarget?: any): Object {
        const construct = matchObjectPath(this.config.construct, pathBuilder(this.config.pathSeparator, this.path), '');
        if (construct) {
            return construct.call(this.context, target, argArray, newTarget);
        }

        return new target(...argArray);
    }
};

export const triageTraps = triageSet({
    error: Object.assign({}, traps, readOnlyTrapsMixin),
    silent: Object.assign({}, traps, silentReadOnlyTrapsMixin)
}, traps);

export default triageTraps;
