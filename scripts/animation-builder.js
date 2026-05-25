// Source: https://gsap.com/docs/v3/GSAP/Timeline/

export default class AnimationBuilder {
  constructor(canvas, durationSeconds) {
    this.canvas = canvas;
    this.durationSeconds = durationSeconds;

    this.timelineData = {
      elements: [],
      animations: [],
    };

    // Optional external update listener
    this.onUpdateListener;

    this.timeline = gsap.timeline({
      paused: true,
      repeat: -1, // Loop the animation indefinitely
      onUpdate: () => {
        if (this.onUpdateListener) {
          this.onUpdateListener(this.timeline);
        }
      },
    });
  }

  buildAnimation() {
    const currentProgress = this.timeline.progress() || 0;
    this.timeline.clear();

    this.buildElements();
    this.buildAnimations();

    this.timeline.progress(currentProgress);
  }

  buildElements() {
    const elementsData = this.timelineData.elements;

    // Clear all elements
    this.canvas.innerHTML = "";

    // Create all elements
    elementsData.forEach((elementData) => {
      const element = document.createElement("h1");
      element.classList.add(elementData.group, elementData.id);
      element.textContent = elementData.content;
      this.canvas.appendChild(element);
    });
  }

  buildAnimations() {
    this.timelineData.animations.forEach((animationData) => {
      const target = animationData.target;

      animationData.properties.forEach((propertyData) => {
        const property = propertyData.property;
        const keyframes = propertyData.keyframes;
        keyframes.sort((a, b) => a.progress - b.progress);

        // If only one keyframe exists, make it a "constant" property value
        if (keyframes.length === 1) {
          gsap.set(`.${target}`, {
            [property]: keyframes[0].value,
          });
        }

        // loop through keyframes and create timeline segments based on the time difference between keyframes
        for (let i = 1; i < keyframes.length; i++) {
          let last = keyframes[i - 1];
          let current = keyframes[i];

          let timeDifferenceSeconds = (current.progress - last.progress) * this.durationSeconds;

          // Set the animation
          this.timeline.to(
            `.${target}`,
            {
              [property]: current.value,
              duration: timeDifferenceSeconds,
              ease: current.ease ? current.ease : "none",
            },
            last.progress * this.durationSeconds,
          );
        }
      });
    });
  }

  setKeyframe(targetName, propertyName, value) {
    let animation = this.timelineData.animations.find((animation) => animation.target === targetName);

    // Create animation if it doesn't exist
    if (!animation) {
      animation = {
        target: targetName,
        properties: [],
      };

      this.timelineData.animations.push(animation);
    }

    // Find property entry
    let propertyEntry = animation.properties.find((property) => property.property === propertyName);

    // Create property if it doesn't exist
    if (!propertyEntry) {
      propertyEntry = {
        property: propertyName,
        keyframes: [],
      };

      animation.properties.push(propertyEntry);
    }

    const currentTime = Math.round(this.timeline.progress() * 100) / 100;

    // Find existing keyframe
    let keyframe = propertyEntry.keyframes.find((keyframe) => keyframe.progress === currentTime);

    // Create keyframe if it doesn't exist
    if (!keyframe) {
      keyframe = {
        progress: currentTime,
        value,
      };

      propertyEntry.keyframes.push(keyframe);
    }

    // Update value
    keyframe.value = value;
    this.buildAnimation();
  }

  setOnUpdateListener(listener) {
    this.onUpdateListener = listener;
  }

  removeOnUpdateListener() {
    this.onUpdateListener = null;
  }

  play() {
    this.timeline.play();
  }

  pause() {
    this.timeline.pause();
  }

  togglePlay() {
    this.timeline.paused(!this.timeline.paused());
  }

  setProgress(value) {
    this.timeline.progress(value);
  }

  getProgress() {
    return this.timeline.progress();
  }

  loadAnimation(filePath) {
    fetch(filePath)
      .then((result) => result.json())
      .then((data) => {
        this.timelineData = data;
        this.buildAnimation();
      });
  }

  saveAnimation(filePath) {
    // TODO
  }
}
