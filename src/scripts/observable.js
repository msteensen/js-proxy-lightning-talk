import { convertToObservable } from "./js-proxy.js";
import { Log } from "./util.js";
let p = convertToObservable({ firstName: 'Mike', lastName: 'Steensen' });
p.addPropertyChangedListener({ onPropertyChanged: (target, prop, oldVal, newVal) => {
        Log(`Object property '${prop}' changed from '${oldVal}' to '${newVal}'`);
    },
    onPropertyChanging(target, property, oldValue, newValue) {
        if (newValue !== null && newValue !== undefined) {
            let allow = true;
            if (property === 'firstName' && typeof (newValue) !== 'string')
                allow = false;
            if (property === 'lastName' && typeof (newValue) !== 'string')
                allow = false;
            if (!allow) {
                Log(`Invalid value passed for property '${property}', invalid value: '${newValue}', invalid type: '${typeof (newValue)}'`);
            }
            return allow;
        }
        return true;
    } });
let person = p.cast();
person.firstName = 'Adam';
person.lastName = 'Via';
try {
    person.firstName = 1;
}
catch (err) {
    Log(err.toString(), true);
}
try {
    person.lastName = 2;
}
catch (err) {
    Log(err.toString(), true);
}
window.person = person;
