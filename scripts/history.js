// Adapted from:
// https://medium.com/@artemkhrenov/the-memento-pattern-in-javascript-state-preservation-made-simple-9ef1e7705651

export default class History {
  #mementos = [];
  #currentIndex = -1;

  // Add a memento to history
  addMemento(memento) {
    // If we've undone some states and then add a new one,
    // discard all redo history
    if (this.#currentIndex < this.#mementos.length - 1) {
      this.#mementos = this.#mementos.slice(0, this.#currentIndex + 1);
    }

    this.#mementos.push(memento);
    this.#currentIndex++;
  }

  // Get the previous memento
  undo() {
    if (this.#currentIndex <= 0) return null;

    this.#currentIndex--;
    return this.#mementos[this.#currentIndex];
  }

  // Get the next memento
  redo() {
    if (this.#currentIndex >= this.#mementos.length - 1) return null;

    this.#currentIndex++;
    return this.#mementos[this.#currentIndex];
  }

  canUndo() {
    return this.#currentIndex > 0;
  }

  canRedo() {
    return this.#currentIndex < this.#mementos.length - 1;
  }

  clear() {
    this.#mementos = [];
    this.#currentIndex = -1;
  }
}