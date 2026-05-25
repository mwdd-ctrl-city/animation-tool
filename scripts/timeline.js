import AnimationBuilder from "./animation-builder.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const canvas = document.querySelector(".canvas");

const animationBuilder = new AnimationBuilder(canvas, 5);
animationBuilder.loadAnimation("./scripts/animation.json");

// When the animation automatically plays the slider updates on the progress of the animation duration
animationBuilder.setOnUpdateListener((timeline) => {
  timelineSlider.value = timeline.progress() * 100;
});

animationControls.forEach((control) => {
  control.addEventListener("input", (event) => {
    const propertyName = event.target.dataset.property;
    const value = parseFloat(event.target.value); /* Todo: Should not be float for all values*/

    animationBuilder.setKeyframe("el-1", propertyName, value); /* Todo: do not hardcode .el-1*/
  });
});

timelineSlider.addEventListener("input", (e) => {
  const progress = e.target.value / 100;
  animationBuilder.setProgress(progress);
});

playButtonTimeline.addEventListener("click", () => {
  const isPaused = animationBuilder.timeline.paused();
  playButtonTimeline.textContent = isPaused ? "Pause" : "play";
  animationBuilder.timeline.paused(!isPaused);
});
