import uniqid from 'uniqid';

export default class List {
    constructor(){
        this.items = []
    }

    addItems(count, unit, ingredients){
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredients
        };

        this.items.push(item)

        return item;
    }

    deleteItem(id){
        const index = this.items.findIndex(el => el.id === id);
        // [3,5,7].splice(1,2) => return [5,7], original [3]
        //[3,5,7].slice(1,2) => [5], original [3,5,7]
        this.items.splice(index, 1);
    }

    updateCount(id, newCount){
        this.items.find(el => el.id === id).count = newCount;
    }
}