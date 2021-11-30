//@ts-nocheck
class EventEmitter {
  listeners: any;

  constructor() {
    this.listeners = {};
  }

  addListener(event, fn) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
    return this;
  }

  on(event, fn) {
    return this.addListener(event, fn);
  }

  removeListener(event, fn) {
    let lis = this.listeners[event];
    if (!lis) return this;
    for (let i = lis.length; i > 0; i--) {
      if (lis[i] === fn) {
        lis.splice(i, 1);
        break;
      }
    }
    return this;
  }

  off(event, fn) {
    return this.removeListener(event, fn);
  }

  once(event, fn) {
    this.listeners[event] = this.listeners[event] || [];
    const onceWrapper = () => {
      fn();
      this.off(event, onceWrapper);
    };
    this.listeners[event].push(onceWrapper);
    return this;
  }

  emit(event, ...args) {
    let fns = this.listeners[event];
    if (!fns) return false;
    fns.forEach((f) => {
      f(...args);
    });
    return true;
  }

  listenerCount(event) {
    let fns = this.listeners[event] || [];
    return fns.length;
  }

  rawListeners(event) {
    return this.listeners[event];
  }
}

export default EventEmitter;
