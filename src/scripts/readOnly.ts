import { Log } from "./util.js";

const readOnlyObj = new Proxy({id: 1, name: 'test', created: new Date()}, {
    set(target, p, newValue, receiver) {
        return false;
    }
});

Log("Readonly Obj name: " + readOnlyObj.name);

try
{
    readOnlyObj.name = 'Test 2';
    //throws error - Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'name'
}
catch (err){
    Log(err.toString(), true);
}