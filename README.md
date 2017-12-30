# recursive-proxy

JS Recursive proxy.

## Usage

```js
import proxyCreator from 'recursive-proxy';

const target = {}; // proxy target

const context = {/* context */};


const RProxy = proxyCreator({
    // Options
    
    // Whether object should be readOnly
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
        // (PE): (currentValue, target, propName) => newValue
    },
    
    // Trap when prop value is changed
    setter: {
        // (PE): (target, propName, newValue) => changeWasAllowed?
    },
    
    // Trap when target is a function and is called
    apply: {
        // (PE): (target, this, argsArray) => anyValue
    },
    
    // Trap when target is a function and is called with "new" operator
    construct: {
        // (PE): (target, argsArray?, newTarget) => object
    }
});

const proxy = RProxy(target, context);
// or with new operator
const proxy = new RProxy(target, context);

```