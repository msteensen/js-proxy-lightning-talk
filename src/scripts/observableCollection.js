import { convertToObservable, convertToObservableCollection } from "./js-proxy.js";
import { Log } from "./util.js";
let c = convertToObservableCollection([]);
window.people = c;
window.convertToObservable = convertToObservable;
let person = { firstName: 'Mike', lastName: 'Steensen' };
c.addCollectionChangedListener({
    onCollectionChanged: function (collection, items, type, index, fromIndex, oldItems) {
        let itemLen = type === 'remove' ? oldItems.length : items.length;
        Log(`People collection changed - Action: ${type}, At Index: ${index}, Item Count: ${itemLen}`);
    }
});
c.push(person);
