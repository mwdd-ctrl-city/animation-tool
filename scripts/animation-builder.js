// Source: https://gsap.com/docs/v3/GSAP/Timeline/
import { buildVisualizer } from "./timeline.js"

export default class AnimationBuilder extends EventTarget {
  // Private fields
  #canvas;
  #durationSeconds;
  #selectedText;
  #timelineData;
  #timeline;
  #onUpdateListener;

  constructor(canvas, durationSeconds) {
    super();

    this.#canvas = canvas;
    this.#durationSeconds = durationSeconds;

    this.#selectedText = "el-1"; 

    // Create an empty json structure with timeline data
    this.#timelineData = {
      elements: [],
      animations: [],
    };

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
    gsap.registerPlugin(Draggable);
    const elementsData = this.#timelineData.elements;

    // Clear all elements
    this.#canvas.innerHTML = "";

    // Create all elements
    elementsData.forEach((elementData) => {
      const element = document.createElement("h1");
      element.classList.add(elementData.group, elementData.id);
      element.textContent = elementData.content;
      element.contentEditable = false; //https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable
      this.#canvas.appendChild(element);

      const scope = this; 

      Draggable.create(element, {
        bounds: this.#canvas,

        onClick: () => { 
          this.#selectedText = elementData.id; 
          element.style.backgroundColor = element.style.backgroundColor === "deeppink" ? "transparent" : "deeppink";
          element.contentEditable = true;

          this.#updateInputTarget(); 
          buildVisualizer(); 
        },

        onDragEnd: function () {
          scope.setKeyframe(elementData.id, "x", this.x)
          scope.setKeyframe(elementData.id, "y", this.y)
        }
      });

      element.addEventListener("dblclick", () => {
        const dragInstance = Draggable.get(element);
        if (dragInstance) dragInstance.disable();  //Disable gsap drag on element if in edit mode

        element.contentEditable = true;
        
        element.focus();
      })

      element.addEventListener("blur", () => {
        element.contentEditable = false; 

        const dragInstance = Draggable.get(element);
        if (dragInstance) dragInstance.enable();  //Enable drag after leaving edit mode
      })
    });
  }

  #updateInputTarget() {
    const animationControls = document.querySelectorAll(".animation-control");

    animationControls.forEach((control) => {
      const propertyName = control.dataset.property
      const target = document.querySelector(`.${this.#selectedText}`);
      const currentValue = gsap.getProperty(target, propertyName)

      control.value = currentValue
    })
  }

  setText(text) {
    let newTextElement = {"id": `el-${(this.timelineData.elements.length + 1)}`, "group": "group-1", "content": `${text}`}
    
    this.timelineData.elements.push(newTextElement);
    this.buildAnimation();
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

          let value = keyframes[0].value;
   
          // gsap.set(`.${target}`, {
          //   [property]: keyframes[0].value,
          // });

          if (property === "letterSpacing") {
            value += "px"; //TODO: Om al die functionaliteiten te laten werken moet het object van de keyframes uit de json gehaald worden.
          }

          gsap.set(`.${target}`, {
            [property]: value
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

  #getCurrentProgress() {
    return Math.round(this.#timeline.progress() * 100) / 100;
  }

  setDuration(newTime){
    this.#durationSeconds = newTime;
    this.#timelineData.duration = newTime;
    this.buildAnimation()
  }

  buildAnimation() {
    
    // Store the current timeline progress and reset the timeline animations
    const currentProgress = this.#timeline.progress() || 0;
    this.#timeline.clear();

    this.#buildElements();
    this.#buildAnimations();
    this.#updateInputTarget(); 

    this.#timeline.duration(this.#durationSeconds);

    // Set the timeline progress back where the user left off.
    this.#timeline.progress(currentProgress);
  }

  setKeyframe(targetName, propertyName, value) {
    const animation = this.#getOrCreateAnimation(targetName);
    const propertyEntry = this.#getOrCreateProperty(animation, propertyName);

    const currentTime = this.#getCurrentProgress();

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
    this.dispatchEvent(new Event("updateAnimation"));
  }

  moveKeyframe(targetName, propertyName, fromProgress, toProgress) {
    const animation = this.#getOrCreateAnimation(targetName);
    const propertyEntry = this.#getOrCreateProperty(animation, propertyName);
 
    // Search for the keyframe at the given progress
    const keyframe = propertyEntry.keyframes.find((keyframe) => keyframe.progress === fromProgress);
 
    if (!keyframe) return;
 
    // Update the progress of the keyframe
    keyframe.progress = toProgress;
    this.buildAnimation();
    this.dispatchEvent(new Event("updateAnimation"));
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

  get selectedText() {
    return this.#selectedText;
  }

  // Load te animation data from a given filepath
  loadAnimation(filePath) {
    fetch(filePath)
      .then((result) => result.json())
      .then((data) => {
        this.#timelineData = data;
        this.buildAnimation();
        this.dispatchEvent(new Event("updateAnimation"));
      });
  }

  saveAnimation(filePath) {
    // TODO
  }



}