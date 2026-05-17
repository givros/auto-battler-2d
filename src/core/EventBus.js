(function (AB) {
  class EventBus {
    constructor() {
      this.listeners = new Map();
    }

    on(eventName, handler) {
      const handlers = this.listeners.get(eventName) || [];
      handlers.push(handler);
      this.listeners.set(eventName, handlers);
      return () => this.off(eventName, handler);
    }

    off(eventName, handler) {
      const handlers = this.listeners.get(eventName);
      if (!handlers) {
        return;
      }
      this.listeners.set(
        eventName,
        handlers.filter((item) => item !== handler),
      );
    }

    emit(eventName, payload) {
      const handlers = this.listeners.get(eventName) || [];
      handlers.forEach((handler) => handler(payload));
    }
  }

  AB.EventBus = EventBus;
})(window.AutoBattler = window.AutoBattler || {});
