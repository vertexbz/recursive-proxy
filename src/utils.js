// @flow
import type { ObjectOf } from './types';

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
