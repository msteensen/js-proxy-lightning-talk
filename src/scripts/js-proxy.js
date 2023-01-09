function NOU(obj) {
    return obj === null || obj === undefined;
}
function NNOU(obj) {
    return (obj !== null && obj !== undefined);
}
export class PropertyChangedListenerProxy {
    constructor(changing, changed) {
        this._changingCallback = changing;
        this._changedCallback = changed;
    }
    onPropertyChanged(target, property, oldValue, newValue) {
        if (NNOU(this._changedCallback))
            this._changedCallback(target, property, oldValue, newValue);
    }
    onPropertyChanging(target, property, oldValue, newValue) {
        if (NNOU(this._changingCallback))
            return this._changingCallback(target, property, oldValue, newValue);
        return true;
    }
}
export class CollectionChangedListenerProxy {
    constructor(callback) {
        this._callback = callback;
    }
    onCollectionChanged(collection, items, type, index, fromIndex, oldItems) {
        this._callback(collection, items, type, index, fromIndex, oldItems);
    }
}
export function convertToObservable(obj, restrictToObjDef = true) {
    let handlers = [];
    let methods = {
        addPropertyChangedListener: function (handler) {
            handlers.push(handler);
        },
        removePropertyChangedListener: function (handler) {
            let i = handlers.indexOf(handler);
            if (i >= 0)
                handlers.splice(i, 1);
        },
        cast() {
            return this;
        }
    };
    let notifyChanged = function (t, p, o, n) {
        handlers.forEach(h => {
            if (NNOU(h))
                h.onPropertyChanged(t, p, o, n);
        });
    };
    let notifyChanging = function (t, p, o, n) {
        let allow = true;
        handlers.forEach(h => {
            if (NNOU(h) && NNOU(h.onPropertyChanging) && !h.onPropertyChanging(t, p, o, n))
                allow = false;
        });
        return allow;
    };
    let p = new Proxy(obj, {
        get(t, p, r) {
            if (p === 'toString')
                return Reflect.get(t, p, r);
            let m = methods[p];
            if (NNOU(m))
                return m;
            if (Reflect.has(t, p)) {
                let v = Reflect.get(t, p, r);
                return v;
            }
            return undefined;
        },
        set(t, p, v, r) {
            if (Reflect.has(t, p)) {
                let ov = Reflect.get(t, p, r);
                if (ov !== v) {
                    if (!notifyChanging(t, p, ov, v))
                        return false;
                    Reflect.set(t, p, v);
                    notifyChanged(t, p, ov, v);
                }
                return true;
            }
            else if (!restrictToObjDef) {
                obj[p] = v;
                notifyChanged(obj, p, undefined, v);
            }
            return false;
        }
    });
    return p;
}
export function convertToObservableCollection(array) {
    let handlers = [];
    let notify = function (collection, items, type, index, fromIndex, oldItems) {
        handlers.forEach(h => {
            if (NNOU(h))
                h.onCollectionChanged(collection, items, type, index, fromIndex, oldItems);
        });
    };
    let methods = {
        addCollectionChangedListener: function (listener) {
            handlers.push(listener);
        },
        removeCollectionChangedListener: function (listener) {
            let index = handlers.indexOf(listener);
            if (index >= 0)
                handlers.splice(index, 1);
        },
        at: function (index) {
            return array.at(index);
        },
        concat: function (arr) {
            let arr2 = array.concat(arr);
            return convertToObservableCollection(arr2);
        },
        copyWithin: function (index, start, end) {
            let arr2 = array.copyWithin(index, start, end);
            return convertToObservableCollection(arr2);
        },
        entries: function () {
            return array.entries();
        },
        every: function (test, thisArg) {
            return array.every(test, thisArg);
        },
        fill: function (val, start, end) {
            let arr2 = array.fill(val, start, end);
            return convertToObservableCollection(arr2);
        },
        filter: function (filter) {
            let arr2 = array.filter(filter);
            return convertToObservableCollection(arr2);
        },
        find: function (filter, thisArg) {
            return array.find(filter, thisArg);
        },
        findIndex: function (filter, thisArg) {
            return array.findIndex(filter, thisArg);
        },
        findLast: function (filter, thisArg) {
            return array.findLast(filter, thisArg);
        },
        findLastIndex: function (filter, thisArg) {
            return array.findLastIndex(filter, thisArg);
        },
        flat: function () {
            let arr2 = array.flat();
            return convertToObservableCollection(arr2);
        },
        flatMap: function (conv) {
            let arr2 = array.flatMap(conv);
            return convertToObservableCollection(arr2);
        },
        forEach: function (handle, thisArg) {
            array.forEach(handle, thisArg);
        },
        from: function () {
            let arr2 = array.from();
            return convertToObservableCollection(arr2);
        },
        includes: function (item) {
            return array.includes(item);
        },
        indexOf: function (item, fromIndex) {
            return array.indexOf(item, fromIndex);
        },
        join: function (sep) {
            return array.join(sep);
        },
        keys: function () {
            return array.keys();
        },
        lastIndexOf: function (item, fromIndex) {
            return array.lastIndexOf(item, fromIndex);
        },
        map: function (trans, thisArg) {
            let arr2 = array.map(trans);
            return convertToObservableCollection(arr2);
        },
        pop: function () {
            if (array.length === 0)
                return null;
            let lastIndex = array.length - 1;
            let item = array.pop();
            notify(array, [item], 'remove', lastIndex);
        },
        push: function (...items) {
            let index = array.length;
            array.push.apply(array, items);
            notify(array, items, 'add', index);
        },
        reduce: function (func, initialValue) {
            let arr2 = array.reduce(func, initialValue);
            return convertToObservableCollection(arr2);
        },
        reduceRight: function (func, initialValue) {
            let arr2 = array.reduceRight(func, initialValue);
            return convertToObservableCollection(arr2);
        },
        reverse: function () {
            if (array.length === 0)
                return this;
            let array1 = [];
            for (let i = 0; i < array.length; i++) {
                array1.push(array[i]);
            }
            let arr2 = array.reverse();
            notify(array, arr2, 'move', 0, array.length - 1, array1);
            return this;
        },
        shift: function () {
            if (array.length === 0)
                return null;
            let item = array.shift();
            notify(array, [item], 'remove', 0);
            return item;
        },
        slice: function (start, end) {
            let arr2 = array.slice(start, end);
            return convertToObservableCollection(arr2);
        },
        some: function (func, thisArg) {
            return array.some(func, thisArg);
        },
        sort: function (compare) {
            if (array.length <= 1)
                return this;
            array.sort(compare);
            notify(array, array, 'sort', 0);
            return this;
        },
        splice: function (s, dc, ...items) {
            if (s < 0 || s >= array.length)
                throw new Error('Index out of bounds.');
            let deletedItems = array.splice.apply(array, [s, dc].concat(items));
            let type = 'add';
            if (NNOU(dc) && dc > 0) {
                if (NNOU(items) && items.length > 0)
                    type = 'replace';
                else
                    type = 'remove';
            }
            notify(array, items, type, s, undefined, deletedItems);
        },
        unshift: function (...items) {
            let cnt = array.unshift.apply(array, items);
            notify(array, items, 'add', 0);
            return cnt;
        },
        clear: function () {
            if (array.length > 0) {
                let removedItems = array.splice(0, array.length);
                notify(array, removedItems, 'remove', 0);
            }
        }
    };
    let p = new Proxy(array, {
        get(t, p, r) {
            let m = methods[p];
            if (NNOU(m))
                return m;
            if (Reflect.has(t, p)) {
                let v = Reflect.get(t, p, r);
                if (NNOU(v) && Array.isArray(v) && v.length === 1)
                    return v[0];
                return v;
            }
            return undefined;
        },
        set(t, p, v, r) {
            let index = parseInt(p);
            if (isNaN(index))
                throw new Error(`Cannot update property '${p}', the proeprty is not a numerical value.`);
            if (Reflect.has(t, p)) {
                let ov = Reflect.get(t, p, r);
                if (ov !== v) {
                    Reflect.set(t, p, v);
                    notify(t, [v], 'update', index);
                }
                return true;
            }
            else {
                Reflect.set(t, p, v, r);
                notify(t, [v], 'add', index);
            }
            return false;
        }
    });
    return p;
}
export function createNewObservableCollection() {
    return convertToObservableCollection([]);
}
