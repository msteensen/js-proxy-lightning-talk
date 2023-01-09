import { Log } from "./util.js";
const logObj = new Proxy({ id: 1, name: 'test', created: new Date() }, {
    set(target, p, newValue, receiver) {
        const oldVal = target[p];
        Log(`Setting object member '${p}', updating from '${oldVal}' to '${newValue}'`);
        target[p] = newValue;
        return true;
    },
    get(target, p, receiver) {
        const v = target[p];
        Log(`Reading member '${p}, returning value '${v}'`);
        return v;
    }
});
//each of the following outputs to the console.
const logObjId = logObj.id;
const logObjName = logObj.name;
logObj.id = 3;
logObj.name = 'Test 2';
