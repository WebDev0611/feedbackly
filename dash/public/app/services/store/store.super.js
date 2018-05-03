class Store {
  constructor(PubSub, changeEvent) {
    this._PubSub = PubSub;

    this._changeEvent = changeEvent;

    this._items = [];
  }

  onChange(scope, subscription) {
    var token = this._PubSub.subscribe(this._changeEvent, subscription);

    scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
  }

  setItems(newItems) {
    this._items = [...newItems];

    this._PubSub.publish(this._changeEvent);
  }

  getItems() {
    return this._items;
  }

  updateItem(id, updates, idField) {
    idField = idField || '_id';

    var targetItem = _.find(this._items, item => item[idField] === id);

    _.assign(targetItem, updates);

    this._items = [...this._items];

    this._PubSub.publish(this._changeEvent);
  }

  addItem(item) {
    this._items = [...this._items, item];

    this._PubSub.publish(this._changeEvent);
  }

  removeItem(id, idField) {
    idField = idField || '_id';

    var without = _.filter(this._items, item => item._id !== id);

    this._items = [...without];

    this._PubSub.publish(this._changeEvent);
  }
}
