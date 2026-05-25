// Source: https://gsap.com/docs/v3/GSAP/Timeline/

const totalDurationSeconds = 3;
const canvas = document.querySelector(".canvas");

// Define the timeline
const timeline = gsap.timeline({
  paused: true,
  repeat: -1, // Loop the animation indefinitely
  onUpdate: () => onTimelineUpdate(),
});

let timelineData;

fetch("./scripts/animation.json")
  .then((res) => res.json())
  .then((data) => {
    timelineData = data;
    buildAnimation(timelineData);
  });

// animation builder
function buildAnimation(animationData) {
  const currentProgress = timeline.progress() || 0;
  timeline.clear();
  buildElements(animationData.elements);
  buildAnimations(animationData.animations);

  timeline.progress(currentProgress);
}

function buildElements(elementsData) {
  // Clear all elements
  canvas.innerHTML = "";

  // Create all elements
  elementsData.forEach((elementData) => {
    const element = document.createElement("h1");
    element.classList.add(elementData.group, elementData.id);
    element.textContent = elementData.content;
    canvas.appendChild(element);
  });
}

function buildAnimations(animationsData) {
  animationsData.forEach((animationData) => {
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

        let timeDifferenceSeconds = (current.progress - last.progress) * totalDurationSeconds;

        // Set the animation
        timeline.to(
          `.${target}`,
          {
            [property]: current.value,
            duration: timeDifferenceSeconds,
            ease: current.ease ? current.ease : "none",
          },
          last.progress * totalDurationSeconds,
        );
      }
    });
  });
}

function setKeyframe(targetName, propertyName, value) {
  let animation = timelineData.animations.find((animation) => animation.target === targetName);

  // Create animation if it doesn't exist
  if (!animation) {
    animation = {
      target: targetName,
      properties: [],
    };

    timelineData.animations.push(animation);
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

  const currentTime = Math.round(timeline.progress() * 100) / 100;

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
  buildAnimation(timelineData);
}

/* **** */
/*  UI  */
/* **** */

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");

//When the animation automatically plays the slider updates on the progress of the animation duration
function onTimelineUpdate() {
  if (timelineSlider) {
    timelineSlider.value = timeline.progress() * 100;
  }
}

animationControls.forEach((control) => {
  control.addEventListener("input", (event) => {
    const propertyName = event.target.dataset.property;
    const value = parseFloat(event.target.value); /* Todo: Should this be float */

    setKeyframe("el-1", propertyName, value); /* Todo: do not hardcode .el-1*/
  });
});

// create the update when input changes
timelineSlider.addEventListener("input", () => {
  // slide is between 0 - 100, timeline between 0 - 1
  const progressTimeline = timelineSlider.value / 100;
  timeline.progress(progressTimeline);
});

playButtonTimeline.addEventListener("click", () => {
  isPlaying = timeline.paused();
  playButtonTimeline.textContent = isPlaying ? "Pause" : "play";
  timeline.paused(!isPlaying);
});
