// Source:
// https://medium.com/@artemkhrenov/the-memento-pattern-in-javascript-state-preservation-made-simple-9ef1e7705651
export default class History {
    constructor() {
        this.mementos = [];
        this.currentIndex = -1;
    }

    // Add a memento to history
    addMemento(memento) {
        // When adding a new state, remove any "future" states
        if (this.currentIndex < this.mementos.length - 1) {
            this.mementos = this.mementos.slice(0, this.currentIndex + 1);
        }

        this.mementos.push(memento);
        this.currentIndex = this.mementos.length - 1;
    }

    // Get the previous memento
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.mementos[this.currentIndex];
        }
        return null;
    }

    // Get the next memento
    redo() {
        if (this.currentIndex < this.mementos.length - 1) {
            this.currentIndex++;
            return this.mementos[this.currentIndex];
        }
        return null;
    }
}
