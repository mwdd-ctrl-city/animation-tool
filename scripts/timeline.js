import AnimationBuilder from "./animation-builder.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const canvas = document.querySelector(".canvas");

// Create the animationbuilder with the given container to animate with a default timeline of 5 seconds
const animationBuilder = new AnimationBuilder(canvas, 5);

// Load in the JSON data from a file (TODO: later this should become user controllable)
animationBuilder.loadAnimation("./scripts/animation.json");

// When the animation automatically plays the slider updates on the progress of the animation duration
animationBuilder.setOnUpdateListener((timeline) => {
  timelineSlider.value = timeline.progress() * 100;
});

// Connect all sliders to te animation builder
animationControls.forEach((control) => {
  control.addEventListener("input", (event) => {
    // Gather slider property and value
    const propertyName = event.target.dataset.property;
    const value = parseFloat(event.target.value); /* Todo: Should not be float for all values*/

    // Set a new keyframe for the given property with the given value
    animationBuilder.setKeyframe("el-1", propertyName, value); /* Todo: do not hardcode .el-1*/
  });
});

// Allow to scrub through the timeline
timelineSlider.addEventListener("input", (e) => {
  const progress = e.target.value / 100;
  animationBuilder.setProgress(progress);
});

// Connect the play/pause button with the animationBuilder
playButtonTimeline.addEventListener("click", () => {
  const isPaused = animationBuilder.isPaused();
  playButtonTimeline.textContent = isPaused ? "Pause" : "play";
  animationBuilder.togglePlay();
});
