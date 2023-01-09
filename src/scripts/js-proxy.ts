function NOU(obj: any): boolean{
    return obj === null || obj === undefined;
}

function NNOU(obj: any): boolean{
    return (obj !== null && obj !== undefined);
}

export interface IPropertyChangedListener {
    onPropertyChanged?: (target: any, property: string, oldValue: any, newValue: any) => void;
    onPropertyChanging?: (target: any, property: string, oldValue: any, newValue: any) => boolean;
}

export interface ICollectionChangedListener {
    onCollectionChanged(collection: Array<any>, items: any[], type: 'add' | 'remove' | 'move' | 'update' | 'replace' | 'sort', index: number, fromIndex?: number, oldItems?: any[]);
}

export class PropertyChangedListenerProxy implements IPropertyChangedListener {
    private _changingCallback?: (target: any, propert: string, oldValue: any, newValue: any) => boolean;
    private _changedCallback?: (target: any, property: string, oldValue: any, newValue: any) => void;

    constructor(changing?: (target: any, propert: string, oldValue: any, newValue: any) => boolean, changed?: (target: any, property: string, oldValue: any, newValue: any) => void) {
        this._changingCallback = changing;
        this._changedCallback = changed;
    }

    onPropertyChanged(target: any, property: string, oldValue: any, newValue: any){
        if (NNOU(this._changedCallback))
            this._changedCallback(target, property, oldValue, newValue);
    }
    onPropertyChanging(target: any, property: string, oldValue: any, newValue: any){
        if (NNOU(this._changingCallback))
            return this._changingCallback(target, property, oldValue, newValue);

        return true;
    }
}

export class CollectionChangedListenerProxy implements ICollectionChangedListener{
    private _callback: (collection: Array<any>, items: any[], type: 'add' | 'remove' | 'move' | 'update' | 'replace' | 'sort', index: number, fromIndex?: number, oldItems?: any[]) => void;
    constructor(callback: (collection: Array<any>, items: any[], type: 'add' | 'remove' | 'move' | 'update' | 'replace' | 'sort', index: number, fromIndex?: number, oldItems?: any[]) => void)
    {
        this._callback = callback;
    }

    onCollectionChanged(collection: Array<any>, items: any[], type: 'add' | 'remove' | 'move' | 'update' | 'replace' | 'sort', index: number, fromIndex?: number, oldItems?: any[]) {
        this._callback(collection, items, type, index, fromIndex, oldItems);
    }
}

export interface IObservable<T> {
    addPropertyChangedListener(listener: IPropertyChangedListener);
    removePropertyChangedListener(listener: IPropertyChangedListener);
    cast(): T;
}

export interface IObservableCollection<T> extends Array<T> {
    addCollectionChangedListener(listener: ICollectionChangedListener): void;
    removeCollectionChangedListener(listener: ICollectionChangedListener): void;
    clear(): void;
}

export function convertToObservable<T>(obj: any, restrictToObjDef: boolean = true): IObservable<T> {
    let handlers: IPropertyChangedListener[] = [];
    let methods = {
        addPropertyChangedListener: function (handler: IPropertyChangedListener) { handlers.push(handler); },
        removePropertyChangedListener: function (handler: IPropertyChangedListener) {
            let i = handlers.indexOf(handler);
            if (i >= 0)
                handlers.splice(i, 1);
        },
        cast(): T { return this as any as T;  }
    }
    let notifyChanged = function (t: any, p: string, o: any, n: any) {
        handlers.forEach(h => {
            if (NNOU(h))
                h.onPropertyChanged(t, p as string, o, n);
        });
    }

    let notifyChanging = function (t: any, p: string, o: any, n: any): boolean {
        let allow = true;
        handlers.forEach(h => {
            if (NNOU(h) && NNOU(h.onPropertyChanging) && !h.onPropertyChanging(t, p as string, o, n))
                allow = false;
        });

        return allow;
    }
    let p = new Proxy(obj,
        {
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
                        if (!notifyChanging(t, p as string, ov, v))
                            return false;
                        Reflect.set(t, p, v);
                        notifyChanged(t, p as string, ov, v);
                    }
                    return true;
                }
                else if (!restrictToObjDef) {
                    obj[p] = v;
                    notifyChanged(obj, p as string, undefined, v);
                }
                return false;
            }
        });

    return p as any as IObservable<T>;
}

export function convertToObservableCollection<T>(array: T[]): IObservableCollection<T> {
    let handlers: ICollectionChangedListener[] = [];
    let notify = function (collection: Array<any>, items: any[], type: 'add' | 'remove' | 'move' | 'update' | 'replace' | 'sort', index: number, fromIndex?: number, oldItems?: any[]) {
        handlers.forEach(h => {
            if (NNOU(h))
                h.onCollectionChanged(collection, items, type, index, fromIndex, oldItems);
        })
    }
    let methods = {
        addCollectionChangedListener: function (listener: ICollectionChangedListener) {
            handlers.push(listener);
        },
        removeCollectionChangedListener: function (listener: ICollectionChangedListener) {
            let index = handlers.indexOf(listener);
            if (index >= 0)
                handlers.splice(index, 1);
        },
        at: function (index: number): any {
            return (array as any).at(index);
        },
        concat: function (arr: any[]): IObservableCollection<T> {
            let arr2 = array.concat(arr);
            return convertToObservableCollection(arr2);
        },
        copyWithin: function (index: number, start: number, end?: number): IObservableCollection<T> {
            let arr2 = array.copyWithin(index, start, end);
            return convertToObservableCollection(arr2);
        },
        entries: function (): IterableIterator<any> {
            return array.entries();
        },
        every: function (test: (a: any, index: number, arr: any[]) => boolean, thisArg?: any): boolean {
            return array.every(test, thisArg);
        },
        fill: function (val: any, start?: number, end?: number): IObservableCollection<T> {
            let arr2 = array.fill(val, start, end);
            return convertToObservableCollection(arr2);
        },
        filter: function (filter: (v: any, index: number, arr: any[]) => boolean): IObservableCollection<T> {
            let arr2 = array.filter(filter);
            return convertToObservableCollection(arr2);
        },
        find: function (filter: (v: any, index: number, arr: any[]) => boolean, thisArg?: any): any {
            return array.find(filter, thisArg);
        },
        findIndex: function (filter: (v: any, index: number, arr: any[]) => boolean, thisArg?: any): number {
            return array.findIndex(filter, thisArg);
        },
        findLast: function (filter: (v: any, index: number, arr: any[]) => boolean, thisArg?: any): any {
            return (array as any).findLast(filter, thisArg);
        },
        findLastIndex: function (filter: (v: any, index: number, arr: any[]) => boolean, thisArg?: any): number {
            return (array as any).findLastIndex(filter, thisArg);
        },
        flat: function (): IObservableCollection<T> {
            let arr2 = (array as any).flat() as any[];
            return convertToObservableCollection(arr2);
        },
        flatMap: function (conv: (item) => any): IObservableCollection<T> {
            let arr2 = (array as any).flatMap(conv) as any[];
            return convertToObservableCollection(arr2);
        },
        forEach: function (handle: (v: any, index: number, arr: any[]) => void, thisArg: any): void {
            array.forEach(handle, thisArg)
        },
        from: function (): IObservableCollection<T> {
            let arr2 = (array as any).from() as any[];
            return convertToObservableCollection(arr2);
        },
        includes: function (item: any): boolean {
            return (array as any).includes(item);
        },
        indexOf: function (item: any, fromIndex?: number): number {
            return array.indexOf(item, fromIndex);
        },
        join: function (sep?: string): string {
            return array.join(sep);
        },
        keys: function (): IterableIterator<number> {
            return array.keys();
        },
        lastIndexOf: function (item: any, fromIndex?: number): number {
            return array.lastIndexOf(item, fromIndex);
        },
        map: function (trans: (item: any, index: number, arr: any[]) => any, thisArg?: any): IObservableCollection<T> {
            let arr2 = array.map(trans);
            return convertToObservableCollection(arr2);
        },
        pop: function (): any {
            if (array.length === 0)
                return null;

            let lastIndex = array.length - 1;
            let item = array.pop();
            notify(array, [item], 'remove', lastIndex);
        },
        push: function (...items: T[]) {
            let index = array.length;
            array.push.apply(array, items);
            notify(array, items, 'add', index);
        },
        reduce: function (func: (accum: any[], curr: any, index: number, arr: any[]) => any[], initialValue?: any): IObservableCollection<T> {
            let arr2 = array.reduce(func, initialValue);
            return convertToObservableCollection(arr2);
        },
        reduceRight: function (func: (accum: any[], curr: any, index: number, arr: any[]) => any[], initialValue?: any): IObservableCollection<T> {
            let arr2 = array.reduceRight(func, initialValue);
            return convertToObservableCollection(arr2);
        },
        reverse: function (): IObservableCollection<T> {
            if (array.length === 0)
                return this;

            let array1: any[] = [];
            for (let i = 0; i < array.length; i++) {
                array1.push(array[i]);
            }

            let arr2 = array.reverse();
            notify(array, arr2, 'move', 0, array.length - 1, array1);

            return this;
        },
        shift: function (): any {
            if (array.length === 0)
                return null;

            let item = array.shift();
            notify(array, [item], 'remove', 0)

            return item;
        },
        slice: function (start?: number, end?: number): IObservableCollection<T> {
            let arr2 = array.slice(start, end);
            return convertToObservableCollection(arr2);
        },
        some: function (func: (elem: any, index: number, array: any[]) => boolean, thisArg?: any): boolean {
            return array.some(func, thisArg);
        },
        sort: function (compare?: (a: any, b: any) => number): IObservableCollection<T> {
            if (array.length <= 1)
                return this;

            array.sort(compare);
            notify(array, array, 'sort', 0);

            return this;
        },
        splice: function (s: number, dc: number, ...items: T[]): void {
            if (s < 0 || s >= array.length)
                throw new Error('Index out of bounds.');

            let deletedItems = array.splice.apply(array, [s, dc].concat(items as any[]));
            let type: 'add' | 'remove' | 'move' | 'update' | 'replace' = 'add';
            if (NNOU(dc) && dc > 0) {
                if (NNOU(items) && items.length > 0)
                    type = 'replace';
                else
                    type = 'remove';
            }

            notify(array, items, type, s, undefined, deletedItems);
        },
        unshift: function (...items: T[]): number {
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
    }
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
            let index = parseInt(p as string);
            if (isNaN(index))
                throw new Error(`Cannot update property '${p as string}', the proeprty is not a numerical value.`)

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

    return p as any as IObservableCollection<T>;
}

export function createNewObservableCollection<T>(): IObservableCollection<T> {
    return convertToObservableCollection<T>([]);
}