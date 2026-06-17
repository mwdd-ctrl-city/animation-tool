// Source:
// https://medium.com/@artemkhrenov/the-memento-pattern-in-javascript-state-preservation-made-simple-9ef1e7705651

/**
 * @classdesc Manages a linear undo/redo history stack using the Memento pattern
 */
export default class History {
    /**
     * @description Create an empty History instance
     */
    constructor() {
        // Array holding all saved snapshots (mementos)
        this.mementos = [];

        // Current active status in this history.
        // -1 because it means "before the first element". Arrays start from 0.
        this.currentIndex = -1;
    }

    /**
     * @description Add a memento to the history stack. Any undone states ahead
     * of the current index are discarded before the new memento is added
     * @param {*} memento The state snapshot to store
     */
    addMemento(memento) {
        // When adding a new state, remove any "future" states
        if (this.currentIndex < this.mementos.length - 1) {
            this.mementos = this.mementos.slice(0, this.currentIndex + 1);
        }

        // Store a deep copy (structuredClone) to avoid accidental mutation in the future.
        this.mementos.push(structuredClone(memento));
        // Update index to point to newest state.
        this.currentIndex = this.mementos.length - 1;
    }

    /**
     * @description Move back one step in history and return the previous memento
     * @returns {*} The previous memento, or null if already at the oldest state
     */
    undo() {
        // Only undo when there is a previous state available
        // if not: return null. 
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.mementos[this.currentIndex];
        }
        return null;
    }

    /**
     * @description Move forward one step in history and return the next memento
     * @returns {*} The next memento, or null if already at the most recent state
     */
    redo() {
        // only redo when there is a future state available
        // if not: return null;
        if (this.currentIndex < this.mementos.length - 1) {
            this.currentIndex++;
            return this.mementos[this.currentIndex];
        }
        return null;
    }

    /**
     * Clear all history
     */
    clear() {
        this.mementos = [];
        this.currentIndex = -1;
    }
}