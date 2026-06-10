/** 
 * @classdesc Domain class containing methods to manipulate and export animations
*/

// class is used as a blueprint to make an Object/objects.
// "export default" makes it possible to export it to different files (where you need to import this file).
// "extends EventTarget" makes it possible to take EventTarget (custom event listener) to different files.

    // the "#" makes the field private: this way you can't break the data from outside this file.
    // with "new Map()" you make a private field (elements, groups, animations) have a empty Map.
export default class AnimationData extends EventTarget {
    #name;
    #durationSeconds;
    #elements;
    #animations;
    selectedText = null; 


    /**
     * @description Create an animation object storing animation data
     * @param {string} name The name of the animation
     * @param {number} durationSeconds The duration (in seconds) of the animation
     */

    // the "constructor" is a function, which is used to prepare the object for use.
    // The "constructor" sets initial values and runs automatically.
    constructor(name = "Untitled", durationSeconds = 10) {
        super();

        // "this" refers to object that is being made.
        this.#elements = new Map(); 
        this.#animations = new Map();
        // Make sure the duration is a positive number
        // "throw" makes it possible to make a custom error in the console. You can "catch" later to make it visual for the user and handle the error.
        if (!this.#isValidDuration(durationSeconds)) {
            throw new RangeError("durationSeconds must be a positive number");
        }

        // save the parameter (name, durationSeconds) in the field (#name, #durationSeconds) of this object.
        this.#name = name;
        this.#durationSeconds = durationSeconds;
        this.selectedText = {
            element: null,
            id: null
        };
    }




    // -----------------------
    // MARK: Validation
    // -----------------------

    /**
     * @description Validate if given progress value is valid (between 0 and 1 inclusive)
     * @param {float} progress progress within the animation 
     * @returns {boolean} true if progress is a valid number between 0 and 1 (inclusive), false if not
     */
    // "typeof" (operator) checks what type of value it is. It returns as a string.
    #isValidProgress(progress) {
        return typeof progress === "number" && progress >= 0 && progress <= 1;
    }

    /**
     * @description Validate if the duration in seconds is a positive number
     * @param {number} durationSeconds  The duration of the animation in seconds
     * @returns {boolean} true if the duration is a valid, positive number, false if not
     */
    #isValidDuration(durationSeconds) {
        return typeof durationSeconds === "number" && durationSeconds > 0;
    }



    // -----------------------
    // MARK: Meta
    // -----------------------

    /**
     * @description Set the total duration of the animation
     * @param {number} durationSeconds The duration of the animation in seconds
     * @returns {boolean} true if the duration is valid and applied, false if not
     */
    setDuration(durationSeconds) {
        if (!this.#isValidDuration(durationSeconds)) return false;
        this.#durationSeconds = durationSeconds;

        // "dispatchEvent" catches that something changed in the data.
        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Set the name of te animation
     * @param {string} name The name of the animation
     */
    setName(name) {
        // "trim" is used to erase the spaces (outside).
        this.#name = name.trim();

        this.dispatchEvent(new Event("change"));
        return true;
    }



    // -----------------------
    // MARK: Elements
    // -----------------------

    /**
     * @description Create a new element in the animation
     * @param {string} elementName The display name of the new element
     * @returns {string} the internal UUID of the element used for referencing
     */

    // Create an element with a key (id (random/unique)) and a value (elementName)
    createElement(elementName) {
        const elementId = crypto.randomUUID();

        // "set" (operator) adds the key and value (id, elementName) to the Map #elements
        this.#elements.set(elementId, elementName);
        this.setSelectedText(null, elementId);

        this.dispatchEvent(new Event("change"));

        // returns id: with the id you can find the element in the Map.
        // We don't return elementName, because you can't find the id based on the value, but you can find the value based on the id.
        return elementId;
    }

    /**
     * @description Remove an element from the animation, including all groups
     * @param {string} elementId The internal UUID of the element
     * @returns {boolean} true if the element is found and deleted, false if not
     */

    removeElement(elementId) {
        // Remove element from elements if possible (else return false)
        // value is connected to a unique key (elementId), so when deleted both the key and the value are removed.
        if (!this.#elements.delete(elementId)) return false;

        // Remove element from all animations
        // The animations can also have a reference to the key (elementId), so they need to be cleaned as well.
        this.#animations.delete(elementId);

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Rename the display name of an element
     * @param {string} elementId The UUID of the element
     * @param {string} elementName The new display name of the element
     * @returns {boolean} true if the element is found and renamed, false if not
     */

    // Update of the data. It takes two inputs, namely the key (elementId) and value (elementName). 
    // It takes the key of the element you want to rename (elementId) and the new name you want to give it (elementName)
    renameElement(elementId, elementName) {
        if (!this.#elements.has(elementId)) return false;

        this.#elements.set(elementId, elementName.trim());

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Get an element by ID
     * @param {string} elementId The UUID of the element
     * @returns {string} The element of the given UUID. Null if not found
     */
    getElement(elementId) {
        if (!this.#elements.has(elementId)) return null;
        // With "structuredClone" you make a copy of the data, so when there are changes to the data it is always to the copy and not of the original.
        return structuredClone(this.#elements.get(elementId));
    }

    /**
     * @description Get a Map of all elements contained in the animation
     * @returns {Map} Map with all elements of the animation
     */
    getElements() {
        return structuredClone(this.#elements);
    }

    // -----------------------
    // MARK: Keyframe
    // -----------------------

    /**
     * Private helper that gets or creates the animations on a target.
     * @param {string} targetId The UUID of the target
     * @returns {Map} The animations data of the target. 
     * If it did not exist previously, a new, empty animations object is returned
     */

    // Private function, because outside of this file it is no use.
    // "targetId" is the same as elementId earlier, but in this context it refers to the target you want to animate, hence targetId.
    #getOrCreateAnimation(targetId) {
        // Checks if the map #animations has the targetId. If it doens't have the targetId, then it creates a new empty map and stores it under targetId.
        if (!this.#animations.has(targetId)) {
            this.#animations.set(targetId, new Map());
        }

        // Returns the #animations map for targetId.
        return this.#animations.get(targetId);
    }

    /**
     * @description Private helper that gets or creates the keyframe list for a property.
     * @param {Map} animationMap The animation map belonging to a target
     * @param {string} propertyName The name of the animated property
     * @returns {Array} The keyframe list for the property
     */
    // Private function that takes the animationMap of a specific element and the name of the property (propertyName) you want to animate.
    // "animationMap" is a single entry of the #animations map.
    #getOrCreateProperty(animationMap, propertyName) {
        // Checks if the property (propertyName) already exists in the animationMap.
        // If it doesn't exist yet, it makes an empty array for the property. In this array the keyframes will be placed later.
        if (!animationMap.has(propertyName)) {
            animationMap.set(propertyName, []);
        }

        return animationMap.get(propertyName);
    }

    /**
     * @description Set a new keyframe for the animation
     * @param {string} targetId The target to apply the keyframe to
     * @param {string} propertyName The property to be animated
     * @param {float} progress The point in time of the keyframe (between 0 and 1 inclusive)
     * @param {number} value The value of te property at this time
     * @param {string} ease [optional] Easing function to apply to this keyframe
     * @returns {boolean} true if the target was found and the progress is valid, otherwise false
     */

    // TODO: check of animation direction nodig is op keyframe
   // Takes 5 inputs: targetId (element you want to animate), propertyName (property to animate), 
    // progress (point in time, number between 0 and 1), value (value at that point in time) and ease (easing type, defaults "none" if not provided)
    setKeyframe(targetId, propertyName, progress, value, ease, splitType = "none") {
        if (!this.#elements.has(targetId)) return false;
      
        if (!this.#isValidProgress(progress)) return false;

        // Get the keyframe of the specified target, property and progress
        // Gets or creates an animationMap for the target (targetId).
        // Gets or creates keyframes array for this property. 
        const animationMap = this.#getOrCreateAnimation(targetId);
        const keyframes = this.#getOrCreateProperty(animationMap, propertyName);
        // Searches the keyframes array for a keyframe at this progress point.
        // "find" returns first keyframe with the condition given.
        // takes input (kf, each keyframe from the array) and checks if the progress matches. 
        let keyframe = keyframes.find(kf => kf.progress === progress);

        // If the keyframe does not exist, create it, else edit it
        // If it doesn't exist, it creates a new object with 3 properties: progress, value, ease.
        if (!keyframe) {
            keyframe = { progress, value, ease, splitType };
            keyframes.push(keyframe);
            // Resort the keyframes, so it goes from small to big.
            keyframes.sort((a, b) => a.progress - b.progress);
        } else {
            // Updates the value and ease from the keyframe.
            // Progress doesn't need to be updated, because the keyframe was found by it's progress, so it is already updated. 
            keyframe.value = value;
            keyframe.ease = ease;
            keyframe.splitType = splitType;
        }

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Delete a keyframe from the animation
     * @param {string} targetId The target to remove the keyframe from
     * @param {string} propertyName The property to remove the keyframe from
     * @param {float} progress The point in time of the keyframe (between 0 and 1 inclusive)
     * @returns {boolean} true if the target and property was found and the progress is 
     * valid, otherwise false
     */
    // The function takes 3 inputs from the keyframe you want to delete.
    deleteKeyframe(targetId, propertyName, progress) {
        // Check if animations has the target
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return false;

        // check if the target has the property
        const keyframes = animationMap.get(propertyName);
        if (!keyframes) return false;

        // Check if the target property has a keyframe at progress.
        // "findIndex" returns the position of the item (index) in the keyframes array
        const index = keyframes.findIndex(kf => kf.progress === progress);
        // "index === -1" means the whole array (keyframes) is searched, but nothing is found.
        if (index === -1) return false;

        // If so, delete the keyframe
        // "splice" needs a number, not an object. That is why we need "findIndex" instead of "find". 
        // "splice" deletes the value and moves the rest to fill the gap made.
        // "1" says that 1 item needs to be deleted.
        keyframes.splice(index, 1);

        // Cleanup if empty
        // if the keyframes array is empty, it deletes the property (propertyName) from the animationMap.
        if (keyframes.length === 0) {
            animationMap.delete(propertyName);
        }

        // if the animationMap is empty, it deletes the targetId from the #animations map.
        if (animationMap.size === 0) {
            this.#animations.delete(targetId);
        }

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Delete all keyframes of a specific property from a target
     * @param {string} targetId The target to remove the property from
     * @param {string} propertyName The property to remove
     * @returns {boolean} true if the property was found and deleted, otherwise false
     */
    // The function has to know the target (element that is being animated) and the property name
    deleteProperty(targetId, propertyName) {
        // Check if animations has the target
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return false;

        // Check if the map has the property and delete it
        if (animationMap.has(propertyName)) {
            animationMap.delete(propertyName);

            // If the animationMap is empty, it deletes the targetId from the #animations map.
            if (animationMap.size === 0) {
                this.#animations.delete(targetId);
            }

            this.dispatchEvent(new Event("change"));
            return true;
        }

        return false;
    }

    /**
     * @description Move a keyframe to a different location
     * @param {string} targetId The target to move the keyframe of
     * @param {string} propertyName The property to move the keyframe of
     * @param {float} fromProgress The old point in time of the 
     * keyframe (between 0 and 1 inclusive)
     * @param {number} toProgress The new point in time of the 
     * keyframe (between 0 and 1 inclusive)
     * @returns {boolean} true if the target and property was found and the progress 
     * is valid, otherwise false. Also return false if toProgress already has a keyframe
     */
    // Takes 4 inputs: targetId (element you want to animate), propertyName (the name of the property),
    // fromProgress (current progress point) and toProgress (new progress point).
    moveKeyframe(targetId, propertyName, fromProgress, toProgress) {
        // Check if the target exists as an element or group
        if (!this.#elements.has(targetId)) {
            return false;
        }

        // Check if both progress values (fromProgress and toProgress) are valid: number between 0 and 1.
        if (!this.#isValidProgress(fromProgress) || !this.#isValidProgress(toProgress)) {
            return false;
        }

        // Check if the target has any animations
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return false;

        // Check if the target has keyframes for the given property
        const keyframes = animationMap.get(propertyName);
        if (!keyframes) return false;

        // Check if a keyframe exists at fromProgress
        const keyframe = keyframes.find(kf => kf.progress === fromProgress);
        if (!keyframe) return false;

        // Prevent overwriting an existing keyframe at toProgress
        const collision = keyframes.find(kf => kf.progress === toProgress);
        if (collision) return false;

        // Move the keyframe and re-sort by progress (small to big)
        keyframe.progress = toProgress;
        // It sorts based on size: if a.progress is smaller than b.prgress, then it is negative and you know that a.progress is earlier.
        // We sort again because a keyframe is moved, so maybe there is a new order.
        keyframes.sort((a, b) => a.progress - b.progress);

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Get all keyframes for a target property
     * @param {string} targetId The UUID of the target
     * @param {string} propertyName The name of the animated property
     * @returns {Array} List of keyframes for the property. Empty array if not found
     */
    getKeyframes(targetId, propertyName) {
        const animationMap = this.#animations.get(targetId);
        // If there isn't a animationMap for this targetId in the #animations map, then it makes an empty array.
        // We return an empty array so you can "move along" in the function, otherwise it would return null. 
        if (!animationMap) return [];

        const keyframes = animationMap.get(propertyName);
        if (!keyframes) return [];

        return structuredClone(keyframes);
    }

    /**
     * @description Get all animated properties on a target
     * @param {string} targetId The UUID of the target
     * @returns {Array<string>} List of animated property names. Empty array if none exist
     */
    getProperties(targetId) {
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return [];

        // It returns an array based on the keys of the animationMap.
        // Makes an array of only the keys in the animationMap.
        return Array.from(animationMap.keys());
    }

    getAnimations(targetId){
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return false;

        return structuredClone(animationMap);
    }

    /**
     * @description Get the display name of the animation
     * @returns {string} The animation name
     */
    getName() {
        return this.#name;
    }

    /**
     * @description Get the total duration of the animation
     * @returns {number} The duration of the animation in seconds
     */
    getDuration() {
        return this.#durationSeconds;
    }

    // -----------------------
    // MARK: Selected Text
    // -----------------------
    setSelectedText(element = null, id) {
        this.selectedText.element = element; 
        this.selectedText.id = id

        this.dispatchEvent(new Event("change"));
    }

    clearSelectedText() {
        this.selectedText.element = null; 
        this.selectedText.id = null;

        this.dispatchEvent(new Event("change"));
    }

    getSelectedText() {
        return this.selectedText
    }


    // -----------------------
    // MARK: Input/Output
    // -----------------------

    /**
     * @description Get a serializable snapshot of the full animation data
     * @returns {object} Plain object representation of the animation,
     * safe to pass to JSON.stringify or load()
     */
    getAnimation() {
        return {
            name: this.#name,
            duration: this.#durationSeconds,
            elements: structuredClone(this.#elements),
            animations: structuredClone(this.#animations),
        };
    }

    /**
     * @description Load animation data into this animation instance
     * @param {object} animation Serializable animation object previously 
     * exported from an Animation instance
     */
    load(animation) {
        this.#name = animation.name;
        this.#durationSeconds = animation.duration;
        this.#elements = structuredClone(animation.elements);
        this.#animations = structuredClone(animation.animations);

        this.dispatchEvent(new Event("change"));
    }

    /**
     * @description Export the animation as a JSON string
     * @returns {string} JSON representation of the animation
     */
    toJSON() { // Generated by ChatGPT
        return JSON.stringify({
            name: this.#name,
            duration: this.#durationSeconds,
            elements: Object.fromEntries(this.#elements),
            animations: Object.fromEntries(
                [...this.#animations.entries()].map(([id, props]) => [
                    id, Object.fromEntries(props)
                ])
            ),
        });
    }

    /**
     * @description Load animation data from a JSON string
     * @param {string} json JSON representation of an animation
     * @returns {boolean} true if the JSON was parsed and loaded successfully, false if not
     */
    fromJSON(json) { // Generated by ChatGPT
        try {
            const data = JSON.parse(json);
            this.load({
                name: data.name,
                duration: data.duration,
                elements: new Map(Object.entries(data.elements)),
                animations: new Map(
                    Object.entries(data.animations).map(([id, props]) => [
                        id,
                        new Map(Object.entries(props))
                    ])
                )
            });
            return true;
        } catch {
            return false;
        }
    }
}