// @flow
export type ObjectOf<T> = {
    [key: string]: T
};

export type RecursiveProxyOptions = {
    value: ObjectOf<any>,
    creator: ObjectOf<(any, Object, string) => any>,
    setter: ObjectOf<(Object, string, any) => boolean>,
    apply: ObjectOf<(target: Function, any, argArray?: any) => any>,
    construct: ObjectOf<(target: Function, any, newTarget?: any) => Object>,
    readOnly: false | 'silent' | 'error',
    pathSeparator: string
};

export type RecursiveContext<C, O, T, N> = {
    config: N,
    context: C,
    origin: O,
    path: Array<string>,
    target: T,
    traps: Proxy$traps<*>
};
