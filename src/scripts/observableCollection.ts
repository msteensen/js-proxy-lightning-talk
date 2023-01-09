import { convertToObservable, convertToObservableCollection, IObservable, IObservableCollection } from "./js-proxy.js";
import { Log } from "./util.js";

interface IPerson{
    firstName: string;
    lastName: string;
}

let c: IObservableCollection<IPerson> = convertToObservableCollection<IPerson>([]);


(window as any).people = c;
(window as any).convertToObservable = convertToObservable;


let person: IPerson = { firstName: 'Mike', lastName: 'Steensen' };

c.addCollectionChangedListener({
    onCollectionChanged: function(collection: Array<any>, items: any[], type: 'add' | 'remove' | 'move' | 'update' | 'replace' | 'sort', index: number, fromIndex?: number, oldItems?: any[]){
        let itemLen = type === 'remove' ? oldItems.length : items.length;
        Log(`People collection changed - Action: ${type}, At Index: ${index}, Item Count: ${itemLen}`)
    }
});



c.push(person);
