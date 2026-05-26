// Source: https://gsap.com/docs/v3/GSAP/Timeline/

export default class AnimationBuilder {
  constructor(canvas, durationSeconds) {
    this.canvas = canvas;
    this.durationSeconds = durationSeconds;

    // Create an empty json structure with timeline data
    this.timelineData = {
      elements: [],
      animations: [],
    };

    // Optional external update listener
    this.onUpdateListener;

    // Create the Gsap timeline
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
    // Store the current timeline progress and reset the timeline animations
    const currentProgress = this.timeline.progress() || 0;
    this.timeline.clear();

    this.buildElements();
    this.buildAnimations();
    this.buildVisualizer();

    // Set the timeline progress back where the user left off.
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
    // Loop over every element's animations
    this.timelineData.animations.forEach((animationData) => {
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
          let timeDifferenceSeconds = (current.progress - last.progress) * this.durationSeconds;

          // Set the animation keyframe in Gsap
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

    // Search if the element already has animation data
    let animation = this.timelineData.animations.find((animation) => animation.target === targetName);

    // Create animation data if it doesn't exist
    if (!animation) {
      animation = {
        target: targetName,
        properties: [],
      };

      this.timelineData.animations.push(animation);
    }

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

    const currentTime = Math.round(this.timeline.progress() * 100) / 100;

    // Search if the current time already contains a keyframe
    let keyframe = propertyEntry.keyframes.find((keyframe) => keyframe.progress === currentTime);

    // Create keyframe if it doesn't exist
    if (!keyframe) {
      keyframe = {
        progress: currentTime,
        value,
      };

      propertyEntry.keyframes.push(keyframe);
    }

    // Update the value of te keyframe
    keyframe.value = value;
    this.buildAnimation();
  }

  // Add a callback function that runs if the timeline is updated
  setOnUpdateListener(listener) {
    this.onUpdateListener = listener;
  }

  // remove callback function that runs if the timeline is updated
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

  isPaused() {
    return this.timeline.paused();
  }

  setProgress(value) {
    this.timeline.progress(value);
  }

  getProgress() {
    return this.timeline.progress();
  }

  // Load te animation data from a given filepath
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


buildVisualizer() {
  const visualizerContainer = document.querySelector(".timeline-container"); // jouw DOM-element
  visualizerContainer.innerHTML = " "

  // Get the data from the json
  this.timelineData.animations.forEach((animationData) => {
    animationData.properties.forEach((propertyData) => {

      // Create elements to create for each functionality a row
      const row = document.createElement("div");
      row.classList.add("row");

      const track = document.createElement("div");
      track.classList.add("track");

      const trackText = document.createElement("p");
      trackText.classList.add("track-label");

      row.append(trackText, track)

      trackText.innerHTML = `<span>${propertyData.property}</span>`;

      // Create for each keyframe point a point on the row
      propertyData.keyframes.forEach((keyframe) => {
        const point = document.createElement("div");
        point.classList.add("keyframe");
        point.style.left = `calc(${keyframe.progress * 100}% - 7px)`;
        track.appendChild(point);
      });

    // Add the elements to the html
      visualizerContainer.appendChild(row);
    });
  });
};

}


