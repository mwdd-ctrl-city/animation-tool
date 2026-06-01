import Animation from "./animations/animation.js";
import AnimationPlayer from "./animations/animation-player.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const tracksContainer = document.querySelector(".timeline-container");
const canvas = document.querySelector(".canvas");

const textInput = document.getElementById("input-text");
const textButton = document.getElementById("input-button");

let activeKeyframe = null;

// -----------------------
// Load
// -----------------------

async function loadAnimation(filePath) {
  const response = await fetch(filePath);
  const data = await response.json();

  const animation = new Animation(data.name, data.duration);

  // Recreate elements, keeping a map from old id → new uuid
  const idMap = {};
  Object.entries(data.elements).forEach(([id, content]) => {
    idMap[id] = animation.createElement(content);
    // Timeline timer 
    // Save the current progress in a const
    const progress = timeline.progress();
    // Use a number to show into a string .tofixed(2) the 2 is for the decimals
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    const current = (progress * timeline.duration()).toFixed(2)
    // Get the timelines current number / get the duration of the timeline
    document.querySelector('.tl-time-start').value = current;


    updateRangeInputs()
  });

  // Set the value from the input end time to the setDuration
  document.querySelector('.tl-time-end').addEventListener('change', (e) => {
    animationBuilder.setDuration(parseFloat(e.target.value));
  });

  // Input starting point when the value is changed devide with the duration and set the new progress to te playhead
  document.querySelector('.tl-time-start').addEventListener('change', (e) => {
    const time = parseFloat(e.target.value);
    const progress = time / animationBuilder.timelineData.duration;
    animationBuilder.setProgress(progress);
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

    // Recreate groups
    Object.entries(data.groups).forEach(([, group]) => {
      const groupId = animation.createGroup(group.name);
      group.members.forEach(oldId => {
        animation.addToGroup(groupId, idMap[oldId]);
      });
    });

    // Recreate keyframes
    Object.entries(data.animations).forEach(([oldTargetId, properties]) => {
      const newTargetId = idMap[oldTargetId];
      Object.entries(properties).forEach(([propertyName, keyframes]) => {
        keyframes.forEach(({ progress, value, ease }) => {
          animation.setKeyframe(newTargetId, propertyName, progress, value, ease);
        });
      });
    });

    return animation;
  }

// -----------------------
// Init
// -----------------------

const animation = await loadAnimation("./scripts/animation.json");
  const player = new AnimationPlayer(canvas, animation);

  function getFirstElementId() {
    return Object.keys(animation.getElements())[0] ?? null;
  }

  // -----------------------
  // Player listeners
  // -----------------------

  player.setOnUpdateListener((timeline) => {
    const progress = timeline.progress();
    const current = (progress * timeline.duration()).toFixed(2);

    timelineSlider.value = progress * 100;

    document.querySelector(".tl-time-start").textContent = `${current}s`;
    document.querySelector(".tl-time-end").textContent = ` ${timeline.duration().toFixed(2)}s`;

    updateRangeInputs();
  });

  // -----------------------
  // Animation change listener
  // -----------------------

  animation.addEventListener("change", () => {
    buildVisualizer();
  });

  // -----------------------
  // Controls
  // -----------------------

  animationControls.forEach((control) => {
    control.addEventListener("input", (event) => {
      const elementId = getFirstElementId(); // TODO change this to "active" element
      if (!elementId) return;

      player.pause();

      const propertyName = event.target.dataset.property;
      const value = parseFloat(event.target.value); // TODO: should not be float for all values

      animation.setKeyframe(elementId, propertyName, player.getProgress(), value);
    });
  });

  timelineSlider.addEventListener("input", (e) => {
    player.setProgress(e.target.value / 100);
  });

  playButtonTimeline.addEventListener("click", () => {
    const isPaused = player.isPaused();
    playButtonTimeline.textContent = isPaused ? "Pause" : "Play";
    player.togglePlay();
  });

  // -----------------------
  // Visualizer
  // -----------------------

  function buildVisualizer() {
    const visualizerContainer = document.querySelector(".timeline-container");
    visualizerContainer.innerHTML = "";

    const elementId = getFirstElementId();  // TODO change this to "active" element
    if (!elementId) return;

    const properties = animation.getProperties(elementId);

    properties.forEach((propertyName) => {
      const keyframes = animation.getKeyframes(elementId, propertyName);

      const row = document.createElement("div");
      row.classList.add("row");

      const track = document.createElement("div");
      track.classList.add("track");

      const trackText = document.createElement("p");
      trackText.classList.add("track-label");
      trackText.innerHTML = `<span>${propertyName}</span>`;

      row.append(trackText, track);

      keyframes.forEach((keyframe) => {
        const point = document.createElement("div");
        point.classList.add("keyframe");
        point.style.setProperty("--p", keyframe.progress);
        track.appendChild(point);

        Draggable.create(point, {
          type: "x",
          bounds: track,
          onDragEnd() {
            const trackWidth = track.offsetWidth;
            const pointX = this.x + trackWidth * keyframe.progress;
            const toProgress = Math.max(0, Math.min(1, pointX / trackWidth));

            animation.moveKeyframe(elementId, propertyName, keyframe.progress, toProgress);
          }
        });
      });

      visualizerContainer.appendChild(row);
    });
  }

  // -----------------------
  // Range input sync
  // -----------------------

  function updateRangeInputs() {
    const elementId = getFirstElementId();  // TODO change this to "active" element
    if (!elementId) return;

    const currentProgress = player.getProgress();

    animationControls.forEach((control) => {
      const propertyName = control.dataset.property;
      const keyframes = animation.getKeyframes(elementId, propertyName);

      if (!keyframes || keyframes.length === 0) {
        control.value = 0;
        return;
      }

      const target = canvas.querySelector(`.el-${elementId}`);
      if (!target) return;

      control.value = gsap.getProperty(target, propertyName);
    });
  }

  // -----------------------
  // Text input
  // -----------------------

  textButton.addEventListener("click", () => addText(textInput.value));

  textInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") addText(textInput.value);
  });

  function addText(text) {
    if (!text.trim()) return;
    animation.createElement(text);
    textInput.value = "";
  }

  // -----------------------
  // Playhead height
  // -----------------------

  function updatePlayheadHeight() {
    const containerBottom = tracksContainer.getBoundingClientRect().bottom;
    const sliderTop = timelineSlider.getBoundingClientRect().top;
    const height = containerBottom - sliderTop;
    timelineSlider.style.setProperty("--height-playhead", `${height}px`);
  }

  const observer = new ResizeObserver(updatePlayheadHeight);
  observer.observe(tracksContainer);

  updatePlayheadHeight();
  buildVisualizer();