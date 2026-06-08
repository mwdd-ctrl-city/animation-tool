import Animation from "./animations/animation.js";
import AnimationPlayer from "./animations/animation-player.js";
import History from "./memento/history.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const tracksContainer = document.querySelector(".timeline-container");
const canvas = document.querySelector(".canvas");

const textInput = document.getElementById("input-text");
const textButton = document.getElementById("input-button");

const startTimeInput = document.querySelector(".tl-time-start");
const endTimeInput = document.querySelector(".tl-time-end");

const undoButton = document.querySelector(".undo");
const redoButton = document.querySelector(".redo");

let activeKeyframe = null;

let currentSplitType = "none";

// -----------------------
// Load animation
// -----------------------

async function loadAnimation(filePath) {
  const response = await fetch(filePath);
  const data = await response.json();

  const animation = new Animation(data.name, data.duration);

  const idMap = {};

  // Elements
  Object.entries(data.elements).forEach(([id, content]) => {
    idMap[id] = animation.createElement(content);
  });

  // Groups
  Object.entries(data.groups).forEach(([, group]) => {
    const groupId = animation.createGroup(group.name);

    group.members.forEach((oldId) => {
      if (idMap[oldId]) {
        animation.addToGroup(groupId, idMap[oldId]);
      }
    });
  });

  // Keyframes
  Object.entries(data.animations).forEach(([oldTargetId, properties]) => {
    const newTargetId = idMap[oldTargetId];
    if (!newTargetId) return;

    Object.entries(properties).forEach(([propertyName, keyframes]) => {
      keyframes.forEach(({
        progress,
        value,
        ease
      }) => {
        animation.setKeyframe(
          newTargetId,
          propertyName,
          progress,
          value,
          ease
        );
      });
    });
  });

  return animation;
}

// -----------------------
// Init
// -----------------------

const animation = await loadAnimation("./scripts/animation.json");
const history = new History();
history.addMemento(structuredClone(animation.animation));

const player = new AnimationPlayer(canvas, animation);

animation.addEventListener("change", () => {
  buildVisualizer();
})

function getFirstElementId() {
  return Object.keys(animation.getElements())[0] ?? null;
}

undoButton.addEventListener("click", () => {
  const state = history.undo();

  if (state !== null) {
    animation.load(state);
  }
});

redoButton.addEventListener("click", () => {
  const state = history.redo();

  if (state !== null) {
    animation.load(state);
  }
})

// -----------------------
// Player update
// -----------------------

player.setOnUpdateListener((timeline) => {
  const progress = timeline.progress();
  const current = (progress * timeline.duration()).toFixed(2);

  timelineSlider.value = progress * 100;

  if (startTimeInput) {
    startTimeInput.value = current;
  }

  if (endTimeInput) {
    endTimeInput.value = timeline.duration().toFixed(2);
  }

  updateRangeInputs();
});

// -----------------------
// Controls (keyframes)
// -----------------------

animationControls.forEach((control) => {
  control.addEventListener("input", (event) => {
    const elementId = getFirstElementId();
    if (!elementId) return;

    player.pause();

    const propertyName = event.target.dataset.property;
    const value = parseFloat(event.target.value);

    const currentTextCase = document.querySelector('input[name="text-case"]:checked').value;
    const ease = "none"; // TODO: allow setting easing per keyframe

    animation.setKeyframe(
      elementId,
      propertyName,
      player.getProgress(),
      value,
      ease,
      currentSplitType,
      currentTextCase
    );
  });

  control.addEventListener("change", (event) => {
    history.addMemento(structuredClone(animation.animation));
  });
});

// -----------------------
// Timeline slider
// -----------------------

timelineSlider.addEventListener("input", (e) => {
  player.setProgress(e.target.value / 100);
});

// -----------------------
// Play button
// -----------------------

playButtonTimeline.addEventListener("click", () => {
  const isPaused = player.isPaused();
  playButtonTimeline.textContent = isPaused ? "Pause" : "Play";
  player.togglePlay();
});

// -----------------------
// Visualizer
// -----------------------

function buildVisualizer() {
  const container = document.querySelector(".timeline-container");
  container.innerHTML = "";

  const elementId = getFirstElementId();
  if (!elementId) return;

  const properties = animation.getProperties(elementId);

  properties.forEach((propertyName) => {
    const keyframes = animation.getKeyframes(elementId, propertyName);

    const row = document.createElement("div");
    row.classList.add("row");

    const track = document.createElement("div");
    track.classList.add("track");

    const label = document.createElement("p");
    label.classList.add("track-label");
    label.innerHTML = `<span>${propertyName}</span>`;

    row.append(label, track);

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

          const pointX =
            this.x + keyframe.progress * trackWidth;

          const newProgress = Math.max(
            0,
            Math.min(1, pointX / trackWidth)
          );

          animation.moveKeyframe(
            elementId,
            propertyName,
            keyframe.progress,
            newProgress
          );
        }
      });
    });

    container.appendChild(row);
  });
}

// -----------------------
// Range inputs sync
// -----------------------

function updateRangeInputs() {
  const elementId = getFirstElementId();
  if (!elementId) return;

  animationControls.forEach((control) => {
    const propertyName = control.dataset.property;

    let target = canvas.querySelector(`.el-${elementId}`);
    if (!target) return;

    // Get current split type from the active split button, set target to first split element of that type
    if (target.splitInstance) {
      const splitType = currentSplitType; // TODO: should get the split type from the keyframe data instead of using a global variable
      if (splitType === "chars" && target.splitInstance.chars) target = target.splitInstance.chars[0];
      else if (splitType === "words" && target.splitInstance.words) target = target.splitInstance.words[0];
      else if (splitType === "lines" && target.splitInstance.lines) target = target.splitInstance.lines[0];
    }

    control.value = gsap.getProperty(target, propertyName);
  });
}

// -----------------------
// Text input
// -----------------------

textButton.addEventListener("click", () =>
  addText(textInput.value)
);

textInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") addText(textInput.value);
});

function addText(text) {
  if (!text.trim()) return;
  animation.createElement(text);
  textInput.value = "";
  history.addMemento(structuredClone(animation.animation));
}

// -----------------------
// Playhead height fix
// -----------------------

function updatePlayheadHeight() {
  const containerBottom =
    tracksContainer.getBoundingClientRect().bottom;
  const sliderTop =
    timelineSlider.getBoundingClientRect().top;

  const height = containerBottom - sliderTop;

  timelineSlider.style.setProperty(
    "--height-playhead",
    `${height}px`
  );
}

const observer = new ResizeObserver(updatePlayheadHeight);
observer.observe(tracksContainer);

updatePlayheadHeight();
buildVisualizer();

//! Animation direction
// const DirectionRadios = document.querySelectorAll('input[name="animation-direction"]');

// // Function that executes when the value of the direction radios changes
// DirectionRadios.forEach(radio => {
//   radio.addEventListener('change', (e) => {
//     const propertyName = e.target.dataset.property;
//     const value = parseFloat(e.target.value); // TODO: should not be float for all values
//     console.log(value);
//     animation.setKeyframe(getFirstElementId(), propertyName, player.getProgress(), value);
//   });
// });

//! Text casing
const textCaseRadios = document.querySelectorAll('input[name="text-case"]');

// Function that executes when the value of the text case radios changes
textCaseRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const propertyName = e.target.dataset.property;
    const value = e.target.value;
    animation.setKeyframe(getFirstElementId(), propertyName, player.getProgress(), value);
  });
});

// Split text controls
const btnSplitNone = document.getElementById("btn-split-none");
const btnSplitChars = document.getElementById("btn-split-chars");
const btnSplitWords = document.getElementById("btn-split-words");
const btnSplitLines = document.getElementById("btn-split-lines");

// Function that executes when a split type button is clicked
function applySplit(type) {
  currentSplitType = type;

  // Remove active class from all buttons
  document.querySelectorAll('.split-text-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to the clicked button and set the split type as a data attribute on the canvas
  const activeButton = document.getElementById(`btn-split-${type}`);
  if (activeButton) {
    activeButton.classList.add('active');
  }

  const canvas = document.querySelector(".canvas");
  if (canvas) {
    canvas.setAttribute("data-split-type", type);
  }
}

// Add event listeners to split type buttons
if (btnSplitNone) btnSplitNone.addEventListener("click", () => applySplit("none"));
if (btnSplitWords) btnSplitWords.addEventListener("click", () => applySplit("words"));
if (btnSplitChars) btnSplitChars.addEventListener("click", () => applySplit("chars"));
if (btnSplitLines) btnSplitLines.addEventListener("click", () => applySplit("lines"));