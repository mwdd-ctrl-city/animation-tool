import AnimationData from "./animations/animation.js";
import AnimationPlayer from "./animations/animation-player.js";
import History from "./memento/history.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const tracksContainer = document.querySelector(".timeline-container");
const canvas = document.querySelector(".content-canvas");

const addTextButton = document.querySelector(".add-text-button");

const startTimeInput = document.querySelector(".tl-time-start");
const endTimeInput = document.querySelector(".tl-time-end");

const undoButton = document.querySelector(".undo");
const redoButton = document.querySelector(".redo");

const easeSelect = document.querySelector('#animation-select-ease')

let activeKeyframe = null;

// -----------------------
// Load animation
// -----------------------

async function loadAnimation(filePath) {
  const response = await fetch(filePath);
  const json = await response.text();

  const animation = new AnimationData();
  animation.fromJSON(json);

  return animation;
}

// -----------------------
// Init
// -----------------------

const animation = await loadAnimation("./scripts/animation.json");
const history = new History();
history.addMemento(structuredClone(animation.getAnimation()));

const player = new AnimationPlayer(canvas, animation);

animation.addEventListener("change", () => {
  buildVisualizer();
})

function getFirstElementId() {
  return animation.getElements().keys().next().value ?? null;
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

easeSelect.addEventListener('change', () => {
  // The ? stands for a undefined property that doesn't exist in the dom so it doesn't give a undefined
  const ease = easeSelect?.value ?? "none";

  animation.setKeyframe(
    activeElementId,
    activePropertyName,
    player.getProgress(),
    activeValue,
    ease
  );
})

let activeElementId = null;
let activePropertyName = null;
let activeValue = null;

animationControls.forEach((control) => {
  control.addEventListener("input", (event) => {
    const elementId = getFirstElementId();
    if (!elementId) return;

    player.pause();

    const propertyName = event.target.dataset.property;
    const value = parseFloat(event.target.value);

    activeElementId = elementId;
    activePropertyName = event.target.dataset.property;
    activeValue = parseFloat(event.target.value);

    animation.setKeyframe(
      activeElementId,
      activePropertyName,
      player.getProgress(),
      activeValue
    );
  });

  console.log(animation.toJSON())

  control.addEventListener("change", (event) => {
    history.addMemento(structuredClone(animation.getAnimation()));
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
// Input change timeline time
// -----------------------
// Input starting point when the value is changed devide with the duration and set the new progress to te playhead
document.querySelector('.tl-time-start').addEventListener('change', (e) => {
  const time = parseFloat(e.target.value);
  // const progress = time / animationBuilder.timelineData.duration;
  const progress = time / animation.getDuration()
  player.setProgress(progress);
});

document.querySelector('.tl-time-end').addEventListener('change', (e) => {
  const time = parseFloat(e.target.value);
  animation.setDuration(time)

  history.addMemento(structuredClone(animation.getAnimation()))
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

    const target = canvas.querySelector(`.el-${elementId}`);
    if (!target) return;

    control.value = gsap.getProperty(target, propertyName);
  });
}

// -----------------------
// Text input
// -----------------------

addTextButton.addEventListener("click", () => {
  addText("Type something here...")
})

function addText(text) {
  if (!text.trim()) return;
  animation.createElement(text);
  textInput.value = "";
  history.addMemento(structuredClone(animation.getAnimation()));
}

// -----------------------
// Playhead height fix
// -----------------------

function updatePlayheadHeight() {
  const lastRow = tracksContainer.querySelector('.row:last-of-type');
  if (!lastRow) return;

  // Get the height from the container that needs to be track for the height
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const rowBottom = lastRow.getBoundingClientRect().bottom;
  const sliderTop = timelineSlider.getBoundingClientRect().top;

  // Divide by eachother so it doesn't get the whole height. Add 20 to make sure it goes a little below the row.
  const height = rowBottom - sliderTop + 20;
  timelineSlider.style.setProperty('--height-playhead', `${height}px`);
}

// API that tracks if an element changes size
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver 
const observer = new ResizeObserver(updatePlayheadHeight);
observer.observe(tracksContainer);

updatePlayheadHeight();
buildVisualizer();




//! Animation direction
const directionSelect = document.getElementById('animation-direction');

// Set inital direction to normal
canvas.classList.add('dir-normal');

// Set initial text case to initial
canvas.classList.add('case-initial');

// Function that executes when the value of the direction select changes
directionSelect.addEventListener('change', (e) => {

  const propertyName = e.target.dataset.property;
  const value = parseFloat(e.target.value); // TODO: should not be float for all values
  animation.setKeyframe(getFirstElementId(), propertyName, player.getProgress(), value);
});

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