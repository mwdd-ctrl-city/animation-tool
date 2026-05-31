// Source: https://gsap.com/docs/v3/GSAP/Timeline/

export default class AnimationPlayer {
    #canvas;
    #animation;
    #timeline;
    #onUpdateListener;

    constructor(canvas, animation) {
        this.#canvas = canvas;
        this.#animation = animation;
        this.#onUpdateListener = null;

        this.#timeline = gsap.timeline({
            paused: true,
            repeat: -1,
            onUpdate: () => {
                if (this.#onUpdateListener) {
                    this.#onUpdateListener(this.#timeline);
                }
            },
        });

        this.#animation.addEventListener("change", () => this.buildAnimation());
        this.buildAnimation();
    }

    #buildElements() {
        this.#canvas.innerHTML = "";

        const elements = this.#animation.getElements();

        Object.entries(elements).forEach(([id, element]) => {
            const el = document.createElement("h2"); // TODO: element type should probably come from element data
            el.classList.add(`el-${id}`);
            el.textContent = element;
            this.#canvas.appendChild(el);
        });
    }

    #buildAnimations() {
        const duration = this.#animation.getDuration();
        const elements = this.#animation.getElements();
        const groups = this.#animation.getGroups();

        // TODO
        const targetIds = [
            ...Object.keys(elements),
            ...Object.keys(groups),
        ];

        targetIds.forEach((targetId) => {
            const properties = this.#animation.getProperties(targetId);

            properties.forEach((propertyName) => {
                const keyframes = this.#animation.getKeyframes(targetId, propertyName);

                if (keyframes.length === 1) {
                    gsap.set(`.el-${targetId}`, {
                        [propertyName]: keyframes[0].value,
                    });
                    return;
                }

                for (let i = 1; i < keyframes.length; i++) {
                    const last = keyframes[i - 1];
                    const current = keyframes[i];

                    const timeDifferenceSeconds = (current.progress - last.progress) * duration;

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

    buildAnimation() {
        const currentProgress = this.#timeline.progress() || 0;
        this.#timeline.clear();

        this.#buildElements();
        this.#buildAnimations();

        this.#timeline.progress(currentProgress);
    }

    setOnUpdateListener(listener) {
        this.#onUpdateListener = listener;
    }

    removeOnUpdateListener() {
        this.#onUpdateListener = null;
    }

    play() {
        this.#timeline.play();
    }

    pause() {
        this.#timeline.pause();
    }

    togglePlay() {
        this.#timeline.paused(!this.#timeline.paused());
    }

    isPaused() {
        return this.#timeline.paused();
    }

    setProgress(value) {
        this.#timeline.progress(value);
    }

    getProgress() {
        return this.#timeline.progress();
    }
}