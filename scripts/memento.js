// Adapted from:
// https://medium.com/@artemkhrenov/the-memento-pattern-in-javascript-state-preservation-made-simple-9ef1e7705651

export default class Memento {
  #state;

  constructor(state) {
    this.#state = state;
  }

  get state() {
    return this.#state;
  }
}