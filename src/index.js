// @flow
import contextProxy from 'context-proxy';
import { triageTraps } from './traps';

import type { RecursiveProxyOptions } from './types';
import { shouldFollowValue } from './utils';

const defaultOpts = {
    value: {},
    creator: {},
    setter: {},
    construct: {},
    apply: {},
    readonly: false,
    pathSeparator: '.',
    followFunction: true,
    followArray: false,
    followNonPlainObject: false
};

export const recursiveProxy = <S: {}>(opts: $Shape<RecursiveProxyOptions>, target: S, context: {} = {}): S => {
    const config: RecursiveProxyOptions = Object.assign({}, defaultOpts, opts);

    if (!shouldFollowValue(target, config)) {
        throw new Error('Cannot wrap provided target! Check proxy target and config.');
    }

    const traps = triageTraps(config.readOnly);

    return contextProxy(
        target,
        traps,
        { origin: target, context, config, traps, target: null, path: [] }
    );
};

export default recursiveProxy;
