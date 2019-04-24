class Storage {
    constructor() {
      this.map = new Map();
    }

    getItem(key) {
      return this.map.get(key);
    }

    setItem(key, value) {
      this.map.set(key, value);
    }

    removeItem(key, value) {
      this.map.delete(key);
    }
}

export default Storage;
