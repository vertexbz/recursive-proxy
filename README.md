# recursive-proxy

Quite like native ES6 proxy, but recursive!

## Installation

```bash
yarn add recursive-proxy
```

or via NPM

```bash
npm install --save recursive-proxy
```

## Examples

For more details on how does it work check `examples` folder.

To run examples type

```bash
yarn babel-node -- example/gets.js
```

or

```bash
yarn babel-node -- example/observer.js
```

## Usage

```js
import RProxy from 'recursive-proxy';

const target = {}; // proxy target

const context = {/* context */};


const proxyConfig = {
    // Options
    
    // Whether apply (follow) proxy on nested functions
    // bool, default: true
    followFunction: true,
    
    // Whether apply (follow) proxy on nested arrays
    // bool, default: false
    followArray: false,
    
    // Whether apply (follow) proxy on nested, non plain objects
    // bool, default: true
    followNonPlainObject: false,
    
    // Whether proxy should be readOnly
    // values: "error", "silent", false (default)
    readOnly: false,
    
    // Recursive path separator
    // string, default: "."
    pathSeparator: '.',
    
    // Traps
    
    // Each trap definition is an object with path expression as
    // a key and trap specific value or callback. Every callback 
    // function has context bound as this
    
    // Path expression (PE) starts with pathSeparator character (PS)
    // after which (PS) separated path is provided.
    // ex. ".a" is property "a" of target object
    // ex. ".a.b" is property "b" of "a" object of target 
    //
    // Wildcards when (PE) doesn't start with (PS) and there was no 
    // exact path match it can be matched to the property name itself 
    // ex. "a" is property "a" of target object or any of its nodes
    //
    // When there is no wildcard match "" (empty) path is considered
    // as fallback (if present).
    
    // Replace value with provided static value
    value: {
        // (PE): value to be returned for that property
    },
    
    // Replace value with value computed from callback
    // currentValue may come from value trap 
    creator: {
        // (PE): (currentValue, target, propName, pathToTrappedItem) => newValue
    },
    
    // Trap when prop value is changed
    setter: {
        // (PE): (target, propName, newValue, pathToTrappedItem) => changeWasAllowed?
    },
    
    // Trap when target is a function and is called
    apply: {
        // (PE): (target, this, argsArray, pathToTrappedItem) => anyValue
    },
    
    // Trap when target is a function and is called with "new" operator
    construct: {
        // (PE): (target, argsArray?, newTarget, pathToTrappedItem) => object
    }
};

const proxy = RProxy(proxyConfig, target, context);
// or with new operator
const proxy = new RProxy(proxyConfig, target, context);

```

