// @flow
import contextProxy from 'context-proxy';
import { triageTraps } from './traps';

import type { RecursiveProxyOptions } from './types';

const defaultOpts = {
    value: {},
    creator: {},
    setter: {},
    construct: {},
    apply: {},
    readonly: false,
    pathSeparator: '.'
};

export const recursiveProxy = (opts: $Shape<RecursiveProxyOptions> = {}): * => {
    const config: RecursiveProxyOptions = Object.assign({}, defaultOpts, opts);

    return <S: {}>(subject: S, context: {} = {}): S => {

        const traps = triageTraps(config.readOnly);

        return contextProxy(
            subject,
            traps,
            { origin: subject, context, config, traps, target: null, path: [] }
        );
    };
};

export default recursiveProxy;
