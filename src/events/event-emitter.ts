class EventEmitter { 
  listeners: any; //Correct this later

  constructor() {
    this.listeners = {};
  }

  addListener(event: string, fn: () => void) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
    return this;
  }

  on(event: string, fn: (originPoint?: Point, targetPoint?: Point) => void) {
    return this.addListener(event, fn);
  }

  removeListener(event: string, fn: () => void) {
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

  off(event: string, fn: () => void) {
    return this.removeListener(event, fn);
  }

  once(event: string, fn: () => void) {
    this.listeners[event] = this.listeners[event] || [];
    const onceWrapper = () => {
      fn();
      this.off(event, onceWrapper);
    };
    this.listeners[event].push(onceWrapper);
    return this;
  }

  emit(event: string, ...args: [number[], number[]]) {  /// Fix this emit is not always for player move
    let fns = this.listeners[event];
    if (!fns) return false;
    fns.forEach((f: (arg0: number[], arg1: number[]) => void) => {
      f(...args);
    });
    return true;
  }

  listenerCount(event:string) {
    let fns = this.listeners[event] || [];
    return fns.length;
  }

  rawListeners(event: string) {
    return this.listeners[event];
  }
}

export default EventEmitter;
