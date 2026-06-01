export default class Animation extends EventTarget {
    #name;
    #durationSeconds;
    #elements = new Map();
    #groups = new Map();
    #animations = new Map();

    constructor(name = "Untitled", durationSeconds = 10) {
        super();

        this.#name = "Untitled";
        this.#durationSeconds = 10;
        this.#elements = new Map();
        this.#groups = new Map();
        this.#animations = new Map();

        if (typeof name === "object" && name !== null) {
            this.load(name);
            return;
        }

        if (!this.#isValidDuration(durationSeconds)) {
            throw new RangeError("durationSeconds must be a positive number");
        }

        this.#name = name;
    }

    // -----------------------
    // Validation
    // -----------------------

    #isValidProgress(progress) {
        return typeof progress === "number" && progress >= 0 && progress <= 1;
    }

    #isValidDuration(durationSeconds) {
        return typeof durationSeconds === "number" && durationSeconds > 0;
    }

    // -----------------------
    // General
    // -----------------------

    setDuration(durationSeconds) {
        if (!this.#isValidDuration(durationSeconds)) return false;
        this.#durationSeconds = durationSeconds;

        this.dispatchEvent(new Event("change"));
        return true;
    }

    setName(name) {
        this.#name = name;

        this.dispatchEvent(new Event("change"));
        return true;
    }

    // -----------------------
    // Elements
    // -----------------------

    createElement(element) {
        const id = crypto.randomUUID();
        this.#elements.set(id, element);

        this.dispatchEvent(new Event("change"));
        return id;
    }

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

    renameElement(elementId, element) {
        if (!this.#elements.has(elementId)) return false;
        this.#elements.set(elementId, element);

        this.dispatchEvent(new Event("change"));
        return true;
    }

    getElement(elementId) {
        return structuredClone(this.#elements.get(elementId)) ?? null;
    }

    getElements() {
        return structuredClone(Object.fromEntries(this.#elements));
    }

    // -----------------------
    // Groups
    // -----------------------

    createGroup(name) {
        const id = crypto.randomUUID();

        this.#groups.set(id, {
            name,
            members: []
        });

        this.dispatchEvent(new Event("change"));
        return id;
    }

    removeGroup(groupId) {
        const isRemoved = this.#groups.delete(groupId);

        if (isRemoved) this.dispatchEvent(new Event("change"));
        return isRemoved;
    }

    renameGroup(groupId, name) {
        const group = this.#groups.get(groupId);
        if (!group) return false;
        group.name = name;

        this.dispatchEvent(new Event("change"));
        return true;
    }

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

    removeFromGroup(groupId, elementId) {
        const group = this.#groups.get(groupId);
        if (!group) return false;

        group.members = group.members.filter(id => id !== elementId);

        this.dispatchEvent(new Event("change"));
        return true;
    }

    getGroup(groupId) {
        return structuredClone(this.#groups.get(groupId)) ?? null;
    }

    getGroups() {
        return structuredClone(Object.fromEntries(this.#groups));
    }

    getGroupMembers(groupId) {
        const group = this.#groups.get(groupId);
        if (!group) return null;
        return structuredClone(group.members);
    }

    // -----------------------
    // Keyframe
    // -----------------------

    #getOrCreateAnimation(targetId) {
        if (!this.#animations.has(targetId)) {
            this.#animations.set(targetId, new Map());
        }

        return this.#animations.get(targetId);
    }

    #getOrCreateProperty(animationMap, propertyName) {
        if (!animationMap.has(propertyName)) {
            animationMap.set(propertyName, []);
        }

        return animationMap.get(propertyName);
    }

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

    getKeyframes(targetId, propertyName) {
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return [];

        const keyframes = animationMap.get(propertyName);
        if (!keyframes) return [];

        return structuredClone(keyframes);
    }

    getProperties(targetId) {
        const animationMap = this.#animations.get(targetId);
        if (!animationMap) return [];

        return [...animationMap.keys()];
    }

    getName() {
        return this.#name;
    }

    getDuration() {
        return this.#durationSeconds;
    }

    // -----------------------
    // Output
    // -----------------------

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

    // In Animation class
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

    toJSON() {
        return JSON.stringify(this.animation);
    }

    formJSON() {
        // TODO
    }
}