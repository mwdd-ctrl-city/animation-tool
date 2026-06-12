// Source: https://gsap.com/docs/v3/GSAP/Timeline/

/**
 * @classdesc Plays back an Animation instance on a canvas element using GSAP
 */
export default class AnimationPlayer {
    #canvas;
    #animation;
    #timeline;
    #onUpdateListener;

    /**
     * @description Create an AnimationPlayer that drives a GSAP timeline from an Animation instance
     * @param {HTMLElement} canvas The container element to render animation elements into
     * @param {Animation} animation The animation instance to play back
     */
    constructor(canvas, animation) {
        this.#canvas = canvas;
        this.#animation = animation;
        this.#onUpdateListener = null;

        // Initialize the GSAP timeline
        this.#timeline = gsap.timeline({
            paused: true,
            repeat: -1, // Loop indefinitely
            onUpdate: () => {
                if (this.#onUpdateListener) {
                    this.#onUpdateListener(this.#timeline);
                }
            },
        });

        this.#animation.addEventListener("change", () => this.buildAnimation());
        this.buildAnimation();
    }

    // -----------------------
    // MARK: Animation builder
    // -----------------------

    /**
     * @description Clear the canvas and rebuild all DOM elements from the animation
     */
    #buildElements() {
        gsap.registerPlugin(SplitText);

        this.#canvas.innerHTML = "";

        const elements = this.#animation.getElements();

        elements.forEach((element, id) => {
            const el = document.createElement("h2"); // TODO: element type should probably come from element data
            el.classList.add(`el-${id}`);
            el.innerText = element;
            this.#canvas.appendChild(el);
            this.#setupDraggable(el, id);
            this.#setupEditable(el, id);

            // split the element in lines, words and characters using GSAP's SplitText plugin, and store the split instance on the element for later reference in animations
            const split = new SplitText(el, {
                type: "chars, words, lines",
                charsClass: "split-char",
                wordsClass: "split-word",
                linesClass: "split-line"
            });
            el.splitInstance = split; 
        });
    }

    #setupDraggable(el, id) {
        const gsapTimeline = this.#timeline;
        const animationData = this.#animation;

        Draggable.create(el, {
            onDragEnd: function () {
                const dragInstance = Draggable.get(el);
                let progress = gsapTimeline.progress(); //Get the progress of the current timeline

                animationData.setKeyframe(id, "x", progress, this.x, "none");    //Create x keyframe
                animationData.setKeyframe(id, "y", progress, this.y, "none");    //Create y keyframe
            },
            onClick: () => {
                if (this.#animation.selectedText.id == id) {  // If text is already selected dont go thru
                    return; 
                } else {
                    this.#animation.setSelectedText(el, id);
                } 
            }
        })
    }

    #setupEditable(el, id) {
        el.addEventListener("dblclick", () => {
            const dragInstance = Draggable.get(el); // Retrun draggable object that was previously created 
            if (dragInstance) {
                dragInstance.disable();  // Turn off gsap draggable behavior
            }

            // el.textContent = el.innerText;

            if (el.splitInstance) {
                el.splitInstance.revert();
            }

            el.contentEditable = true;
            el.focus();
        });

        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                document.execCommand("insertLineBreak");
            }
        })

        el.addEventListener("blur", () => {
            el.contentEditable = false;
            let textContent = el.innerText; 

            if((textContent.trim()) === "") {
                this.#animation.removeElement(id);
            } else {
                console.log(textContent); 
                this.#animation.renameElement(id, textContent); 
            }

            this.#animation.clearSelectedText(); 

            const dragInstance = Draggable.get(el); // Retrun draggable object that was previously created 
            if (dragInstance) {
                dragInstance.enable();  // Turn on gsap draggable behavior
            }
        })
    }

    /**
     * @description Populate the GSAP timeline with tweens derived from the animation keyframes
     */
    #buildAnimations() {
        // Get all targets
        const duration = this.#animation.getDuration();
        const targetIds = this.#animation.getElements().keys();

        // Apply the animations for each target
        targetIds.forEach((targetId) => {
            const properties = this.#animation.getProperties(targetId);
            const domElement = this.#canvas.querySelector(`.el-${targetId}`);

            // Loop through all properties
            properties.forEach((propertyName) => {
                const keyframes = this.#animation.getKeyframes(targetId, propertyName);

                // Set the first keyframe
                gsap.set(`.el-${targetId}`, {
                    [propertyName]: keyframes[0].value,
                    ease: keyframes[0].ease ?? "none",
                });

                // Create a tween between each pair of consecutive keyframes
                for (let i = 1; i < keyframes.length; i++) {
                    const last = keyframes[i - 1]; // last keyframe
                    const current = keyframes[i]; // current keyframe

                    // Time difference between keyframes
                    let timeDifferenceSeconds = (current.progress - last.progress) * duration;

                    let animationTarget = `.el-${targetId}`;
                    let staggerConfig = null;

                    // Fallback values if the keyframe doesn't specify them
                    const kfSplitType = current.splitType || "none";

                    // If the keyframe has a splittype that is not none and the element has a split instance, target split instance
                    if (kfSplitType !== "none") {
                        animationTarget = domElement.splitInstance[kfSplitType];

                        // Apply a stagger, divide the time difference between keyframes by the number of split elements to get a total stagger duration, and use the direction to determine the stagger's starting point
                        staggerConfig = {
                            amount: timeDifferenceSeconds * 0.5,
                        };

                        timeDifferenceSeconds = timeDifferenceSeconds * 0.5; // Reduct the tween duration to accomodate the stagger
                    }

                    // Apply the keyframe to GSAP
                    this.#timeline.to(
                        animationTarget,
                        {
                            [propertyName]: current.value,
                            duration: timeDifferenceSeconds,
                            ease: current.ease ?? "none",
                            stagger: staggerConfig,
                        },
                        last.progress * duration
                    );
                }
            });
        });
    }

    /**
     * @description Rebuild the canvas elements and GSAP timeline from the current animation state.
     * Preserves the current playback progress across rebuilds
     */
    buildAnimation() {
        // Clear the timeline, but save the current progress
        const currentProgress = this.#timeline.progress() || 0;
        this.#timeline.clear();

        this.#buildElements();
        this.#buildAnimations();

        // Set the progress back
        this.#timeline.progress(currentProgress);
    }

    // -----------------------
    // MARK: Timeline Utility
    // -----------------------

    /**
     * @description Set a listener that is called on every GSAP timeline update tick
     * @param {Function} listener Callback receiving the GSAP timeline as its argument
     */
    setOnUpdateListener(listener) {
        this.#onUpdateListener = listener;
    }

    /**
     * @description Remove the currently registered update listener
     */
    removeOnUpdateListener() {
        this.#onUpdateListener = null;
    }

    /**
     * @description Start or resume playback of the animation
     */
    play() {
        this.#timeline.play();
    }

    /**
     * @description Pause playback of the animation
     */
    pause() {
        this.#timeline.pause();
    }

    /**
     * @description Toggle between playing and paused states
     */
    togglePlay() {
        this.#timeline.paused(!this.#timeline.paused());
    }

    /**
     * @description Check whether the animation is currently paused
     * @returns {boolean} true if the animation is paused, false if playing
     */
    isPaused() {
        return this.#timeline.paused();
    }

    /**
     * @description Seek the animation to a specific point in time
     * @param {float} value The progress to seek to (between 0 and 1 inclusive)
     */
    setProgress(value) {
        this.#timeline.progress(value);
    }

    /**
     * @description Get the current playback progress of the animation
     * @returns {float} The current progress (between 0 and 1 inclusive)
     */
    getProgress() {
        return this.#timeline.progress();
    }
}