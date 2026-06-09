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

  const animationData = new AnimationData();
  animationData.fromJSON(json);

  return animationData;
}

// -----------------------
// Init
// -----------------------

const animationData = await loadAnimation("./scripts/animation.json");
const history = new History();
history.addMemento(animationData.getAnimation());

const player = new AnimationPlayer(canvas, animationData);

animationData.addEventListener("change", () => {
  buildVisualizer();
  updateRangeInputs(); 
})

function getFirstElementId() {

  // Gets the first element in the json and gives the propertie in this case the ID, not the value
  return animationData.getElements().keys().next().value ?? null;


}
undoButton.addEventListener("click", () => {
  const state = history.undo();

  console.log("test");

  if (state !== null) {
    animationData.load(state);
  } else {
    console.log("no state");
  }
});

redoButton.addEventListener("click", () => {
  const state = history.redo();

  if (state !== null) {
    animationData.load(state);
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

let ease;

easeSelect.addEventListener('change', ()=>{
  // The ? stands for a undefined property that doesn't exist in the dom so it doesn't give a undefined
  ease = easeSelect?.value ?? "none";

  animationData.setKeyframe(
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
    const elementId = animationData.getSelectedText().id ?? getFirstElementId();  // If getSelectedText == null / no text selected -> get first element
    if (!elementId) return;

    player.pause();

    const propertyName = event.target.dataset.property;
    const value = parseFloat(event.target.value);

    activeElementId = elementId;
    activePropertyName = event.target.dataset.property;
    activeValue = parseFloat(event.target.value);

    animationData.setKeyframe(
      activeElementId,
      activePropertyName,
      player.getProgress(),
      activeValue,
      ease ?? "none"
    );
  });

  control.addEventListener("change", (event) => {
    history.addMemento(animationData.getAnimation());
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
  const select = player.selectedText 
  console.log(select) 
});

// -----------------------
// Input change timeline time
// -----------------------
// Input starting point when the value is changed devide with the duration and set the new progress to te playhead
document.querySelector('.tl-time-start').addEventListener('change', (e) => {
  const time = parseFloat(e.target.value);
  // const progress = time / animationBuilder.timelineData.duration;
  const progress = time / animationData.getDuration()
  player.setProgress(progress);
});

document.querySelector('.tl-time-end').addEventListener('change', (e) => {
  const time = parseFloat(e.target.value);
  animationData.setDuration(time)

  history.addMemento(animationData.getAnimation())
});

// -----------------------
// Visualizer
// -----------------------

function buildVisualizer() {
  const container = document.querySelector(".timeline-container");
  container.innerHTML = "";

  // With the function you got the ID of the element
  const elementId = animationData.getSelectedText().id;
  if (!elementId) return;

  // get the properties that are defined within the id 
  const properties = animationData.getProperties(elementId);

  // For each property you make a new track and row within the timeline
  properties.forEach((propertyName) => {
    const keyframes = animationData.getKeyframes(elementId, propertyName);

    const row = document.createElement("div");
    row.classList.add("row");

    const track = document.createElement("div");
    track.classList.add("track");

    const label = document.createElement("p");
    label.classList.add("track-label");
    label.innerHTML = `<span>${propertyName}</span>`;

    row.append(label, track);

     // Create for each keyframe point a point on the row
    keyframes.forEach((keyframe) => {
      const point = document.createElement("div");
      point.classList.add("keyframe");
      point.style.setProperty("--p", keyframe.progress);

      track.appendChild(point);

      // Create a drag for the keyframe and update the value
      Draggable.create(point, {
        // Type of way you can dragg the element on the x axis
        type: "x",
        bounds: track,
        onDragEnd() {
          // Get the width from the track and the point element which stands for the keyframe 
          const trackWidth = track.offsetWidth;
          const pointX = this.x + keyframe.progress * trackWidth;

          // calculate the Newprogress by defiding the currentpointX with the trackwidth, the value can't be above 1, and the value can't be below 0
          const newProgress = Math.max( 0,
            Math.min(1, pointX / trackWidth)
          );

          animationData.moveKeyframe(
            elementId,
            propertyName,
            keyframe.progress,
            newProgress
          );
        }
      });
    });

    // Add the elements to the html
    container.appendChild(row);
  });
  // Update the playheadHeight on the height of the container
  updatePlayheadHeight();
}

// -----------------------
// Range inputs sync
// -----------------------

function updateRangeInputs() {
  // Get the active / selected element
  const elementId = animationData.getSelectedText().id;
  if (!elementId) return;

  // Update each control with the current value
  animationControls.forEach((control) => {
    const propertyName = control.dataset.property;

    const target = canvas.querySelector(`.el-${elementId}`);
    if (!target) return;

    // To animate the controls, you need gsap to get the value in between the keyframes
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
  animationData.createElement(text);
  history.addMemento(animationData.getAnimation());
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
  animationData.setKeyframe(getFirstElementId(), propertyName, player.getProgress(), value);
});

//! Text casing
const textCaseRadios = document.querySelectorAll('input[name="text-case"]');

// Function that executes when the value of the text case radios changes
textCaseRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const propertyName = e.target.dataset.property;
    const value = e.target.value;
    animationData.setKeyframe(getFirstElementId(), propertyName, player.getProgress(), value);
  });
});