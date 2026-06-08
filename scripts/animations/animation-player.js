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
        this.#canvas.innerHTML = "";

        const elements = this.#animation.getElements();

        Object.entries(elements).forEach(([id, element]) => {
            const el = document.createElement("h2"); // TODO: element type should probably come from element data
            el.classList.add(`el-${id}`);
            el.textContent = element;
            this.#canvas.appendChild(el);

            this.#setupDraggable(el, id); 
            this.#setupEditable(el, id); 
        });
    }

    #setupDraggable(el, id) {
        const gsapTimeline = this.#timeline; 
        const animationData = this.#animation; 

        Draggable.create(el, {
            bounds: this.#canvas,
            onDragEnd: function () {
                const dragInstance = Draggable.get(el);
                let progress = gsapTimeline.progress(); //Get the progress of the current timeline

                animationData.setKeyframe(id, "x", progress, this.x, "none");    //Create x keyframe
                animationData.setKeyframe(id, "y", progress, this.y, "none");    //Create y keyframe
            }   
        })
    }

    #setupEditable(el, id) {
        el.addEventListener("dblclick", () => {
            const dragInstance = Draggable.get(el); // Retrun draggable object that was previously created 
            if (dragInstance) {
                dragInstance.disable();  // Turn off gsap draggable behavior
            }

            el.contentEditable = true;
            el.focus();
        })

        el.addEventListener("blur", () => {
            el.contentEditable = false; 

            const formattedText = el.innerHTML   // innerHTML gives: first<div><br></div><div><br></div><div>second</div>
                .replace(/<div>/g, "\n")  // Replace <div> with \n -> enter - /g makes global, so not just stop at / replace  first div
                .replace(/<\/div>/g, "")  // Replace </div> with nothing
                .replace(/<br>/g, "")   // Replace <br> with nothing
                .replace(/&nbsp;/g, " ") // Replace &nbsp with space

            if((el.textContent.trim()) === "") {
                this.#animation.removeElement(id);
            } else {
                this.#animation.renameElement(id, formattedText); 
            }

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
        // Get all targets (groups + elements)
        const duration = this.#animation.getDuration();
        const elements = this.#animation.getElements();
        const groups = this.#animation.getGroups();

        const targetIds = [];

        Object.entries(elements).forEach(([id]) => {
            targetIds.push(id);
        });

        Object.entries(groups).forEach(([id]) => {
            targetIds.push(id);
        });

        // Apply the animations for each target
        targetIds.forEach((targetId) => {
            const properties = this.#animation.getProperties(targetId);

            // Loop through all properties
            properties.forEach((propertyName) => {
                const keyframes = this.#animation.getKeyframes(targetId, propertyName);

                // Set the first keyframe
                gsap.set(`.el-${targetId}`, {
                    [propertyName]: keyframes[0].value,
                });

                // Create a tween between each pair of consecutive keyframes
                for (let i = 1; i < keyframes.length; i++) {
                    const last = keyframes[i - 1]; // last keyframe
                    const current = keyframes[i]; // current keyframe

                    // Time difference between keyframes
                    const timeDifferenceSeconds = (current.progress - last.progress) * duration;

                    // Apply the keyframe to GSAP
                    this.#timeline.to(
                        `.el-${targetId}`,
                        {
                            [propertyName]: current.value,
                            duration: timeDifferenceSeconds,
                            ease: current.ease ?? "none",
                        },
                        last.progress * duration,
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