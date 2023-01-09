import { Log } from "./util.js";

const valObj = new Proxy({id: 1, name: 'test', created: new Date()}, {
    set(target, p, newValue, receiver) {
        if (!(p in target))
            return false;

        if (p === 'id' && typeof(newValue) !== 'number')
        {
            Log(`Invalid value passed for id, expected number received ${typeof(newValue)}`);
            return false;
        }
        if (p === 'name' && typeof(newValue) !== 'string')
        {
            Log(`Invalid value passed for name, expected string received ${typeof(newValue)}`);
            return false;
        }

        target[p] = newValue;

        return true;
    }
});

valObj.id = 2; //ok

try
{
    (valObj as any).id = 'test';
    //throws error - Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'id'
}
catch (err){
    Log(err.toString(), true);
}