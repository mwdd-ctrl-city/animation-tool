/** 
 * @classdesc Domain class containing methods to manipulate and export animations
*/
export default class Animation extends EventTarget {
    #name;
    #durationSeconds;
    #elements = new Map();
    #groups = new Map();
    #animations = new Map();

    /**
     * @description Create an animation object storing animation data
     * @param {*} name The name of the animation
     * @param {*} durationSeconds The duration (in seconds) of the animation
     */
    constructor(name = "Untitled", durationSeconds = 10) {
        super();

        this.#name = name;
        this.#durationSeconds = durationSeconds;

        this.#elements = new Map();
        this.#groups = new Map();
        this.#animations = new Map();

        // Make sure the duration is a positive number
        if (!this.#isValidDuration(durationSeconds)) {
            throw new RangeError("durationSeconds must be a positive number");
        }
    }

    // -----------------------
    // MARK: Validation
    // -----------------------

    /**
     * @description Validate if given progress value is valid (between 0 and 1 inclusive)
     * @param {float} progress progress within the animation 
     * @returns {boolean} true if progress is a valid number between 0 and 1 (inclusive), false if not
     */
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

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Set the name of te animation
     * @param {string} name The name of the animation
     */
    setName(name) {
        this.#name = name.trim();
        this.dispatchEvent(new Event("change"));
    }

    // -----------------------
    // MARK: Elements
    // -----------------------

    /**
     * @description Create a new element in the animation
     * @param {string} elementName The display name of the new element
     * @returns {string} the internal UUID of the element used for referencing
     */
    createElement(elementName) {
        const id = crypto.randomUUID();
        this.#elements.set(id, elementName);

        this.dispatchEvent(new Event("change"));
        return id;
    }

    /**
     * @description Remove an element from the animation, including all groups
     * @param {string} elementId The internal UUID of the element
     * @returns {boolean} true if the element is found and deleted, false if not
     */
    removeElement(elementId) {
        if (!this.#elements.has(elementId)) return false;

        this.#elements.delete(elementId);

        // Remove from all groups (but preserve empty groups)
        this.#groups.forEach(group => {
            group.members = group.members.filter(id => id !== elementId);
        });

        // Remove from all animations
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
    renameElement(elementId, elementName) {
        if (!this.#elements.has(elementId)) return false;

        this.#elements.set(elementId, elementName.trim());

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Get an element by ID
     * @param {string} elementId The UUID of the element
     * @returns {object} The element of the given UUID. Null if not found
     */
    getElement(elementId) {
        return structuredClone(this.#elements.get(elementId)) ?? null;
    }

    /**
     * @description Get an object of all elements contained in the animation
     * @returns {object} object with all elements of the animation
     */
    getElements() {
        return structuredClone(Object.fromEntries(this.#elements));
    }

    // -----------------------
    // MARK: Groups
    // -----------------------

    /**
     * @description Create a new (empty) group
     * @param {string} groupName The display name of the group
     * @returns {string} the internal UUID of the group used for referencing
     */
    createGroup(groupName) {
        const id = crypto.randomUUID();
        this.#groups.set(id, { name: groupName.trim(), members: [] });

        this.dispatchEvent(new Event("change"));
        return id;
    }

    /**
     * @description Remove a group from the animation
     * @param {string} groupId The internal UUID of the group
     * @returns {boolean} true if the group is found and deleted, false if not
    */
    removeGroup(groupId) {
        const isRemoved = this.#groups.delete(groupId);

        if (isRemoved) this.dispatchEvent(new Event("change"));
        return isRemoved;
    }

    /**
     * @description Rename the display name of a group
     * @param {string} groupId The UUID of the group
     * @param {string} groupName The new display name of the group
     * @returns {boolean} true if the group is found and renamed, false if not
     */
    renameGroup(groupId, groupName) {
        const group = this.#groups.get(groupId);
        if (!group) return false;
        group.name = groupName.trim();

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Add an element to a group
     * @param {string} groupId The UUID of the group
     * @param {string} elementId The UUID of the element
     * @returns {boolean} true if the group and element was found and added, false if not
     */
    addToGroup(groupId, elementId) {
        if (!this.#elements.has(elementId)) return false;

        const group = this.#groups.get(groupId);
        if (!group) return false;

        if (!group.members.includes(elementId)) {
            group.members.push(elementId);
        }

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Remove an element from a group
     * @param {string} groupId The UUID of the group
     * @param {string} elementId The UUID of the element
     * @returns {boolean} true if the group and element was found and removed, false if not
     */
    removeFromGroup(groupId, elementId) {
        const group = this.#groups.get(groupId);
        if (!group) return false;

        group.members = group.members.filter(id => id !== elementId);

        this.dispatchEvent(new Event("change"));
        return true;
    }

    /**
     * @description Get a group by ID
     * @param {string} groupId The UUID of the group
     * @returns {object} The group of the given UUID. Null if not found
     */
    getGroup(groupId) {
        return structuredClone(this.#groups.get(groupId)) ?? null;
    }

    /**
     * @description Get an object of all groups contained in the animation
     * @returns {Object} object with all groups of the animation
     */
    getGroups() {
        return structuredClone(Object.fromEntries(this.#groups));
    }

    /**
     * @description Get all elements in a group
     * @param {string} groupId The UUID of the group 
     * @returns {Array} List of element UUIDs contained within the group
     */
    getGroupMembers(groupId) {
        const group = this.#groups.get(groupId);
        if (!group) return null;
        return structuredClone(group.members);
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
    #getOrCreateAnimation(targetId) {
        if (!this.#animations.has(targetId)) {
            this.#animations.set(targetId, new Map());
        }

        return this.#animations.get(targetId);
    }

    /**
     * @description Private helper that gets or creates the keyframe list for a property.
     * @param {Map} animationMap The animation map belonging to a target
     * @param {string} propertyName The name of the animated property
     * @returns {Array} The keyframe list for the property
     */
    #getOrCreateProperty(animationMap, propertyName) {
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
    setKeyframe(targetId, propertyName, progress, value, ease = "none") {
        if (!this.#elements.has(targetId) && !this.#groups.has(targetId)) {
            return false;
        }

        if (!this.#isValidProgress(progress)) return false;

        const animationMap = this.#getOrCreateAnimation(targetId);
        const keyframes = this.#getOrCreateProperty(animationMap, propertyName);

        let keyframe = keyframes.find(kf => kf.progress === progress);

        if (!keyframe) {
            keyframe = { progress, value, ease };
            keyframes.push(keyframe);
            keyframes.sort((a, b) => a.progress - b.progress);
        } else {
            keyframe.value = value;
            keyframe.ease = ease;
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
    deleteKeyframe(targetId, propertyName, progress) {
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return false;

        const keyframes = animationMap.get(propertyName);
        if (!keyframes) return false;

        const filtered = keyframes.filter(kf => kf.progress !== progress);
        if (filtered.length === keyframes.length) return false;

        animationMap.set(propertyName, filtered);

        if (filtered.length === 0) animationMap.delete(propertyName);
        if (animationMap.size === 0) this.#animations.delete(targetId);

        this.dispatchEvent(new Event("change"));
        return true;
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
    moveKeyframe(targetId, propertyName, fromProgress, toProgress) {
        if (!this.#elements.has(targetId) && !this.#groups.has(targetId)) {
            return false;
        }

        if (!this.#isValidProgress(fromProgress) || !this.#isValidProgress(toProgress)) {
            return false;
        }

        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return false;

        const keyframes = animationMap.get(propertyName);
        if (!keyframes) return false;

        const keyframe = keyframes.find(kf => kf.progress === fromProgress);
        if (!keyframe) return false;

        const collision = keyframes.find(kf => kf.progress === toProgress);
        if (collision) return false;

        keyframe.progress = toProgress;
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

        return [...animationMap.keys()];
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
    // MARK: Output
    // -----------------------

    /**
     * @description Private helper that gets or creates the keyframe list for a property.
     * @param {Map} animationMap The animation map belonging to a target
     * @param {string} propertyName The name of the animated property
     * @returns {Array} The keyframe list for the property
     */
    get animation() {
        const animations = {};

        this.#animations.forEach((propertyMap, targetId) => {
            animations[targetId] = Object.fromEntries(propertyMap);
        });

        return {
            name: this.#name,
            duration: this.#durationSeconds,
            elements: Object.fromEntries(this.#elements),
            groups: Object.fromEntries(this.#groups),
            animations,
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
        this.#elements = new Map(Object.entries(animation.elements));
        this.#groups = new Map(Object.entries(animation.groups));
        this.#animations = new Map(
            Object.entries(animation.animations).map(([id, props]) => [
                id,
                new Map(Object.entries(props).map(([k, v]) => [k, v]))
            ])
        );

        this.dispatchEvent(new Event("change"));
    }

    /**
     * @description Export the animation as a JSON string
     * @returns {string} JSON representation of the animation
     */
    toJSON() {
        return JSON.stringify(this.animation);
    }

    /**
     * @description Load animation data from a JSON string
     * @param {string} json JSON representation of an animation
     * @returns {boolean} true if the JSON was parsed and loaded successfully, false if not
     */
    fromJSON(json) {
        try {
            this.load(JSON.parse(json));
            return true;
        } catch {
            return false;
        }
    }
}