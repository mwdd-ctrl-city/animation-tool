import Memento from "./memento.js";
import History from "./history.js";

// Source: https://gsap.com/docs/v3/GSAP/Timeline/
export default class AnimationBuilder extends EventTarget {
  // Private fields
  #canvas;
  #durationSeconds;
  #timelineData;
  #timeline;
  #onUpdateListener;
  #history;

  constructor(canvas, durationSeconds) {
    super();

    this.#canvas = canvas;
    this.#durationSeconds = durationSeconds;

    // Create an empty json structure with timeline data
    this.#timelineData = {
      elements: [],
      animations: [],
    };

    this.#history = new History();
    this.#history.addMemento(this.save());

    // Optional external update listener
    this.#onUpdateListener = null;

    // Create the Gsap timeline
    this.#timeline = gsap.timeline({
      paused: true,
      repeat: -1, // Loop the animation indefinitely
      onUpdate: () => {
        if (this.#onUpdateListener) {
          this.#onUpdateListener(this.#timeline);
        }
      },
    });
  }

  #buildElements() {
    const elementsData = this.#timelineData.elements;

    // Clear all elements
    this.#canvas.innerHTML = "";

    // Create all elements
    elementsData.forEach((elementData) => {
      const element = document.createElement("h1");
      element.classList.add(elementData.group, elementData.id);
      element.textContent = elementData.content;
      this.#canvas.appendChild(element);
    });
  }

  #buildAnimations() {
    // Loop over every element's animations
    this.#timelineData.animations.forEach((animationData) => {
      const target = animationData.target;

      // Loop over every property of the element
      animationData.properties.forEach((propertyData) => {
        const property = propertyData.property;
        const keyframes = propertyData.keyframes;

        // Sort the keyframes such that the first keyframe chronologically is first in the list
        keyframes.sort((a, b) => a.progress - b.progress);

        // If only one keyframe exists, make it a "constant" property value
        if (keyframes.length === 1) {
          gsap.set(`.${target}`, {
            [property]: keyframes[0].value,
          });

          return;
        }

        // loop through keyframes and create timeline segments based on the time difference between keyframes
        for (let i = 1; i < keyframes.length; i++) {
          let last = keyframes[i - 1];
          let current = keyframes[i];

          // The time in seconds between keyframes is the difference in progress times the total timeline duration 
          let timeDifferenceSeconds = (current.progress - last.progress) * this.#durationSeconds;

          // Set the animation keyframe in Gsap
          this.#timeline.to(
            `.${target}`,
            {
              [property]: current.value,
              duration: timeDifferenceSeconds,
              ease: current.ease ? current.ease : "none",
            },
            last.progress * this.#durationSeconds,
          );
        }
      });
    });
  }

  #getCurrentProgress() {
    return Math.round(this.#timeline.progress() * 100) / 100;
  }
  
updateAnimation() {
  this.buildAnimation();
  this.dispatchEvent(new Event("updateAnimation"));
}

  save() {
    const stateCopy = JSON.parse(JSON.stringify(this.#timelineData));
    return new Memento(stateCopy);
  }

  restore(memento) {
    if (!memento) return;
    this.#timelineData = JSON.parse(JSON.stringify(memento.state));
    console.log(this.#timelineData);
    this.buildAnimation();
  }

  undo() {
    const memento = this.#history.undo();
    this.restore(memento);
  }

  canUndo() {
    return this.#history.canUndo();
  }
  
  redo() {
    const memento = this.#history.redo();
    this.restore(memento);
  }

  canRedo() {
    return this.#history.canRedo();
  }

buildAnimation() {
  // Store the current timeline progress
  const currentProgress = this.#timeline.progress() || 0;

  // Kill everything GSAP knows about this timeline
  this.#timeline.kill();
  this.#timeline = gsap.timeline({
    paused: true,
    repeat: -1,
    onUpdate: () => {
      if (this.#onUpdateListener) {
        this.#onUpdateListener(this.#timeline);
      }
    },
  });

  this.#buildElements();
  this.#buildAnimations();

  this.#timeline.progress(currentProgress);
}

   #getOrCreateAnimation(targetName) {
    // Search if the element already has animation data
    let animation = this.#timelineData.animations.find((animation) => animation.target === targetName);

    // Create animation data if it doesn't exist
    if (!animation) {
      animation = {
        target: targetName,
        properties: [],
      };

      this.#timelineData.animations.push(animation);
    }

    return animation;
  }

  #getOrCreateProperty(animation, propertyName) {
    // Search if the element already has an animation on the given property
    let propertyEntry = animation.properties.find((property) => property.property === propertyName);

    // Create property if it doesn't exist
    if (!propertyEntry) {
      propertyEntry = {
        property: propertyName,
        keyframes: [],
      };

      animation.properties.push(propertyEntry);
    }

    return propertyEntry;
  }

setKeyframe(targetName, propertyName, value, commit = true) {
  const animation = this.#getOrCreateAnimation(targetName);
  const propertyEntry = this.#getOrCreateProperty(animation, propertyName);

  const currentTime = this.#getCurrentProgress();

  // Search if the current time already contains a keyframe
  let keyframe = propertyEntry.keyframes.find(
    (keyframe) => keyframe.progress === currentTime
  );

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

  // FIRST rebuild animation so state is stable
  this.updateAnimation();

  // THEN store history snapshot AFTER everything is consistent
  if (commit) {
    this.#history.addMemento(this.save());
  }
}

  moveKeyframe(targetName, propertyName, fromProgress, toProgress, commit = true) {
  const animation = this.#getOrCreateAnimation(targetName);
  const propertyEntry = this.#getOrCreateProperty(animation, propertyName);
  const keyframe = propertyEntry.keyframes.find(
    (kf) => kf.progress === fromProgress
  );

  if (!keyframe) return;

  keyframe.progress = toProgress;

  // FIRST rebuild animation so GSAP matches state
  this.updateAnimation();

  // THEN snapshot clean state
  if (commit) {
    this.#history.addMemento(this.save());
  }
}

  // Add a callback function that runs if the timeline is updated
  setOnUpdateListener(listener) {
    this.#onUpdateListener = listener;
  }

  // remove callback function that runs if the timeline is updated
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

  get timelineData() {
    return this.#timelineData;
  }

  // Load te animation data from a given filepath
  loadAnimation(filePath) {
    fetch(filePath)
      .then((result) => result.json())
      .then((data) => {
        this.#timelineData = data;
         this.updateAnimation()
      });
  }

  saveAnimation(filePath) {
    // TODO
  }
}