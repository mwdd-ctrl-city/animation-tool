// Source: https://gsap.com/docs/v3/GSAP/Timeline/

// TODO Remove/edit
let keyframes = [
  { progress: 0, x: 0, rotation: 0, scaleY: 1 }, // progress 0%
  { progress: 1, x: 0, rotation: 0, scaleY: 1 }, // progress 100%
];

// animation builder
function buildAnimation() {
  // store current progress before clearing the timeline so it can be set back after rebuilding
  const currentProgress = timeline.progress() || 0;
  timeline.progress(currentProgress);
  timeline.clear();

  // order keyframes by progress
  keyframes.sort((a, b) => a.progress - b.progress);

  // set initial state of the animation to the first keyframe
  /* TODO: do not hardcode text class */
  gsap.set(".text", {
    x: keyframes[0].x,
    rotation: keyframes[0].rotation /* TODO: do not hardcode properties */,
    scaleY: keyframes[0].scaleY,
  });

  // loop through keyframes and create timeline segments based on the time difference between keyframes
  for (let i = 1; i < keyframes.length; i++) {
    let last = keyframes[i - 1];
    let current = keyframes[i];

    // calculate time difference between current and last keyframe
    let timeDifferenceSeconds = (current.progress - last.progress) * totalDurationSeconds;

    /* TODO: do not hardcode text class */
    timeline.to(".text", {
      x: current.x /* TODO: do not hardcode properties */,
      rotation: current.rotation,
      scaleY: current.scaleY,
      duration: timeDifferenceSeconds,
      ease: "none",
    });
  }
}

function setKeyframe(className, propertyName, value) {
  // round current time to 2 decimal to avoid precision issues
  const currentTime = Math.round(timeline.progress() * 100) / 100; /* TODO set to frames */

  // check if there's already a keyframe at the current time
  let keyframe = keyframes.find((kf) => kf.progress === currentTime); /* TODO set to frames */

  // make new keyframe is there isn't one at the current time
  if (!keyframe) {
    keyframe = {
      progress: currentTime,
      // get current values of the properties
      x: gsap.getProperty(".text", "x") /* TODO: do not hardcode properties */,
      rotation: gsap.getProperty(".text", "rotation"),
      scaleY: gsap.getProperty(".text", "scaleY"),
    };
    keyframes.push(keyframe);
  }

  // update value of the property in the keyframe
  keyframe[propertyName] = value;

  buildAnimation();
}

const totalDurationSeconds = 3;

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");

// Define the timeline
const timeline = gsap.timeline({
  paused: true,
  repeat: -1, // Loop the animation indefinitely
  onUpdate: () => onTimelineUpdate(),
});

// Initial build of the animation
buildAnimation();

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

    setKeyframe(".text", propertyName, value);
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
