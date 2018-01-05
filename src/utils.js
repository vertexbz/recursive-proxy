// @flow
import isObject from 'isobject/index';
import isPlainObject from 'is-plain-object/index';
import type { ObjectOf, RecursiveProxyOptions } from './types';

export const triageSet = <T>(sets: ObjectOf<T>, fallback: T): * => (requested: string | false): T => {
    if (typeof requested === 'string' && requested in sets) {
        return sets[requested];
    }

    return fallback;
};

export const pathBuilder = (glue: string, path: Array<string>): string => {
    return glue + path.join(glue);
};

export const matchObjectPath = <T>(haystack: ObjectOf<T>, path: string, name: string): T | void => {
    for (const [key, value] of Object.entries(haystack)) {
        if (path === key) {
            return (value: any);
        }
    }

    for (const [key, value] of Object.entries(haystack)) {
        if (name === key) {
            return (value: any);
        }
    }

    if ('' in haystack) {
        return haystack[''];
    }

    return undefined;
};

export const nope = () => {
    throw new Error('The object is read only!');
};

export const shh = (): * => true;

export const shouldFollowValue = (value: any, config: RecursiveProxyOptions): boolean => {
    if (config.followFunction && typeof value === 'function') {
        return true;
    }

    if (config.followArray && Array.isArray(value)) {
        return true;
    }

    if (isObject(value)) {
        if (config.followNonPlainObject) {
            return true;
        }

        if (isPlainObject(value)) {
            return true;
        }
    }

    return false;
};

export const getLastPathElement = (path: Array<string>): string => {
    return path.length > 0 ? path[path.length - 1] : '';
};
