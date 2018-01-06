// @flow
export type ObjectOf<T> = {
    [key: string]: T
};

export type Path = Array<string>;

export type RecursiveProxyOptions = {
    value: ObjectOf<any>,
    creator: ObjectOf<(any, Object, string, Path) => any>,
    setter: ObjectOf<(Object, string, any, Path) => boolean>,
    apply: ObjectOf<(target: Function, any, argArray: ?Array<any>, Path) => any>,
    construct: ObjectOf<(target: Function, Array<any>, newTarget: any, Path) => Object>,
    readOnly: false | 'silent' | 'error',
    pathSeparator: string,
    followFunction: boolean,
    followArray: boolean,
    followNonPlainObject: boolean
};

export type RecursiveContext<C, O, T, N> = {
    config: N,
    context: C,
    origin: O,
    path: Path,
    target: T,
    traps: Proxy$traps<*>
};
