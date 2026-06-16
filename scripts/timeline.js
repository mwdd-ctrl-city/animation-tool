import AnimationData from "./animations/animation.js";
import AnimationPlayer from "./animations/animation-player.js";
import History from "./memento/history.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playheadTime = document.querySelector(".playhead-time");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const deleteTextButton = document.querySelector(".delete-text button");
const tracksContainer = document.querySelector(".timeline-container");
const canvas = document.querySelector(".content-canvas");
const canvasContainer = document.querySelector("#original-canvas");

const addTextButton = document.querySelector(".add-text-button");

const startTimeInput = document.querySelector(".tl-time-start");
const endTimeInput = document.querySelector(".tl-time-end");

const undoButton = document.querySelector(".undo");
const redoButton = document.querySelector(".redo");
const resetButton = document.querySelector(".reset");
const confirmResetButton = document.querySelector(".confirm-reset");

const prevKeyframeButton = document.querySelector('.kf-prev');
const nextKeyframeButton = document.querySelector('.kf-next');

const easeSelect = document.querySelector('#animation-select-ease');

const scrollHint = document.querySelector('.scroll-hint');

const projectNameText = document.getElementById("project-name");
const projectNameInput = document.getElementById("project-name-input");

const saveButton = document.querySelector(".save-button");

let activeKeyframeId = null;
let currentSplitType = "none";

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

// Create a default animation
export const animationData = new AnimationData("Hello World", 5);

const animationDataLocalStorage = localStorage.getItem("animationData");
const loadedFromStorage = animationDataLocalStorage && animationData.fromJSON(animationDataLocalStorage);

if (!loadedFromStorage) {
  const defaultElement = animationData.createElement("Hello World!");
  animationData.setKeyframe(defaultElement, "fontSize", 0, 0, "bounce.out");
  animationData.setKeyframe(defaultElement, "fontSize", 0.05, 32, "bounce.out");
}

projectNameText.textContent = animationData.getName();

// Create the history object
export const history = new History();

// Create the player object
export const player = new AnimationPlayer(canvas, animationData);

animationData.addEventListener("change", () => {
  buildVisualizer();
  updateRangeInputs();
  showSelectedText();
})


// MARK: TIJDELIJKE FUNCTIE -> VERANDEREN!
function getFirstElementId() {
  // Gets the first element in the json and gives the property in this case the ID, not the value
  return animationData.getElements().keys().next().value ?? null;
}

undoButton.addEventListener("click", () => {
  const state = history.undo();

  if (state !== null) {
    animationData.load(state);
  }
});

redoButton.addEventListener("click", () => {
  const state = history.redo();

  if (state !== null) {
    animationData.load(state);
  }
});

resetButton.addEventListener("click", (event) => {
  confirmResetButton.classList.toggle("show-confirm");
});

confirmResetButton.addEventListener("click", (event) => {
  animationData.resetCanvas();
  const defaultElement = animationData.createElement("Hello World!");
  animationData.setKeyframe(defaultElement, "fontSize", 0, 0, "bounce.out");
  animationData.setKeyframe(defaultElement, "fontSize", 0.05, 32, "bounce.out");
  createSnapshot(animationData);

  confirmResetButton.classList.remove("show-confirm");
});

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

  if (playheadTime) {
    playheadTime.innerHTML = `${current} <span class="unit">s</span>`;

    playheadTime.style.left = `${progress * 100}%`
  }

  updateRangeInputs();
});

// -----------------------
// Controls (keyframes)
// -----------------------

let ease = easeSelect.value ?? "none";

easeSelect.addEventListener('change', () => {
  // The ? stands for a undefined property that doesn't exist in the dom so it doesn't give a undefined
  ease = easeSelect?.value ?? "none";
})

let activeElementId = null;
let activePropertyName = null;
let activeValue = null;


deleteTextButton.addEventListener("click", () => {
  const selectedElement = animationData.getSelectedText().id;
  if (!selectedElement) return;
  animationData.removeElement(selectedElement)
})

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

document.addEventListener("keydown", (e) => {
  // Claude: How do I check if the user is currently typing in an input field, textarea, or contenteditable element when a keydown event fires? I want to include contenteditable elements because GSAP adds contenteditable="true" to draggable elements.
  const isTyping = e.target.closest('input, textarea, [contenteditable]') !== null;

  if (e.code === "Space") {
    if (isTyping) return;
    e.preventDefault();
    const isPaused = player.isPaused();
    playButtonTimeline.textContent = isPaused ? "Pause" : "Play";
    player.togglePlay();
  }
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

  createSnapshot(animationData);
});


// -----------------------
// Select canvas
// -----------------------
let selectedCanvas = false;

// Claude: Waarom werkt dit niet?
canvasContainer.addEventListener('dblclick', (event) =>{
  if(selectedCanvas === false) {
    if (event.target != canvasContainer) return;  // If double clicked on selected text, dont select canvas

    let canvasId = null

    animationData.getElements().forEach((el, id) => {
      if (event.target != canvasContainer) return;
      // Search for the type canvas whitin the elements
      if (el.type === "canvas") {
        canvasId = id
      }
      
      // If it does'nt exist then return null
      if (!canvasId) return;

        // When it's clicked then the activeElement becomes the canvas id to animate the background
        activeElementId = canvasId
        
        canvas.style.outline = "3px solid #6495ED";
        // Gives the selected id from the canvas 
        animationData.setSelectedText(canvas, canvasId)
      });

      selectedCanvas = true;
  } else {
    canvas.style.outline = "none";
    selectedCanvas = false;
  }
  
  })


// -----------------------
// Visualizer
// -----------------------

function buildVisualizer() {
  const container = document.querySelector(".timeline-container");
  container.innerHTML = "";

  const elementId = animationData.getSelectedText().id ?? getFirstElementId();
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

    // Create text
    const labelText = document.createElement("span");
    labelText.textContent = propertyName;
    labelText.style.cursor = "pointer";

    // Create delete button
    const deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "&times;";
    deleteBtn.classList.add("delete-property-btn");
    deleteBtn.title = `Delete ${propertyName}`;

    // Toggle class that shows delete button
    labelText.addEventListener("click", () => {
      deleteBtn.classList.toggle("show-delete");
    });

    // Call deleteProperty on click
    deleteBtn.addEventListener("click", (event) => {
      // event.stopPropagation();
      animationData.deleteProperty(elementId, propertyName);
      createSnapshot(animationData);
    });

    // Add deletebutton and label text to the <p>
    label.append(deleteBtn, labelText);

    row.append(label, track);

    // Create for each keyframe point a point on the row
    keyframes.forEach((keyframe) => {
      const point = document.createElement("div");
      point.classList.add("keyframe", `key-${keyframe.id}`);
      point.style.setProperty("--p", keyframe.progress);

      track.appendChild(point);

      // Create a drag for the keyframe and update the value
      Draggable.create(point, {
        // Type of way you can dragg the element on the x axis
        type: "x",
        bounds: track,
        onClick() {
          // Make the keyframe the active keyframe
          activeKeyframeId = keyframe.id;
          point.classList.add("active-keyframe");
          player.setProgress(keyframe.progress);
          buildVisualizer();
        },
        onDragEnd() {
          // Get the width from the track and the point element which stands for the keyframe 
          const trackWidth = track.offsetWidth;
          const pointX = this.x + keyframe.progress * trackWidth;

          // Chatgpt to make the calculation: How to make the calculation for the new progress
          // calculate the Newprogress by defiding the currentpointX with the trackwidth, the value can't be above 1, and the value can't be below 0
          const newProgress = Math.max(0,
            Math.min(1, pointX / trackWidth)
          );

          animationData.moveKeyframe(
            keyframe.id,
            newProgress
          );

          // Make the keyframe the active keyframe
          activeKeyframeId = keyframe.id;
          point.classList.add("active-keyframe");
          buildVisualizer();
        }
      });

      // Make the keyframe the active keyframe
      const activeKeyframeElement = document.querySelector(`.key-${activeKeyframeId}`);
      activeKeyframeElement?.classList.add("active-keyframe");
    });

    // Add the elements to the html
    container.appendChild(row);
  });

  updatePlayheadHeight();
  updateScrollHint();

  // Retrieve the active keyframe and give it an active class

  if (activeKeyframeId !== null) {
    const activeKeyframeElement = document.querySelector(`.key-${activeKeyframeId}`)
    activeKeyframeElement?.classList.add("active-keyframe");
  }
}

// Auto-close property delete buttons
document.addEventListener("click", (event) => {
  // Search all properties in the timeline 
  const trackLabels = document.querySelectorAll(".track-label");

  trackLabels.forEach(label => {
    // Check if click wasn't in this label
    if (!label.contains(event.target)) {
      // Search delete button
      const deleteBtn = label.querySelector(".delete-property-btn");

      // If delete buton exist and has visible class, remove visible class
      if (deleteBtn && deleteBtn.classList.contains("show-delete")) {
        deleteBtn.classList.remove("show-delete");
      }
    }
  });

  if (confirmResetButton && !resetButton.contains(event.target) && !confirmResetButton.contains(event.target)) {
    confirmResetButton.classList.remove("show-confirm");
  }
});

// -----------------------
// Keyframe snap buttons
// -----------------------

function nextKeyframeSnap() {
  const currentProgress = player.getProgress();
  let nextProgress = null;

  // Loop whitin the element key and the values for each keyframe 
  animationData.getElements().keys().forEach(element => {
    const animationMap = animationData.getAnimations(element);
    if (!animationMap) return;

    animationMap.values().forEach(keyframes => {
      keyframes.forEach(keyframe => {
        // Check if the progress is higher then the current progress, so you know it comes after the currentkeyframe
        if (keyframe.progress > currentProgress) {
          if (nextProgress === null || keyframe.progress < nextProgress) {
            // If so then the nexprogress is the point the player needs to be set on
            nextProgress = keyframe.progress;

            // Make the keyframe the active keyframe
            activeKeyframeId = keyframe.id;
            const point = document.querySelector(`.key-${activeKeyframeId}`);
            point.classList.add("active-keyframe");
            buildVisualizer();
          }
        }
      })
    })
  })

  if (nextProgress !== null) {
    player.setProgress(nextProgress)
  } else {
    player.setProgress(1)
  }
}

function prevKeyframeSnap() {
  const currentProgress = player.getProgress();
  let prevProgress = null;

  animationData.getElements().keys().forEach(element => {
    const animationMap = animationData.getAnimations(element);
    if (!animationMap) return;

    animationMap.values().forEach(keyframes => {
      keyframes.forEach(keyframe => {
        if (keyframe.progress < currentProgress - 0.0001) {
          if (prevProgress === null || keyframe.progress > prevProgress) {
            prevProgress = keyframe.progress;

            // Make the keyframe the active keyframe
            activeKeyframeId = keyframe.id;
            const point = document.querySelector(`.key-${activeKeyframeId}`);
            point.classList.add("active-keyframe");
            buildVisualizer();
          }
        }
      })
    })
  })

  if (prevProgress !== null) {
    player.setProgress(prevProgress)
  } else {
    player.setProgress(0)
  }
}

nextKeyframeButton.addEventListener('click', (event) => {
  player.pause();
  playButtonTimeline.textContent = player.isPaused() ? "play" : "pause";
  nextKeyframeSnap()
});

prevKeyframeButton.addEventListener('click', (event) => {
  player.pause();
  playButtonTimeline.textContent = player.isPaused() ? "play" : "pause";
  prevKeyframeSnap()
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    prevKeyframeSnap()
  }

  if (event.key === 'ArrowRight') {
    nextKeyframeSnap()
  }
})


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

    let target = canvas.querySelector(`#el-${elementId}`);
    if (!target) return;

    // Get current split type from the active split button, set target to first split element of that type
    if (target.splitInstance) {
      const splitType = currentSplitType; // TODO: should get the split type from the keyframe data instead of using a global variable
      if (splitType === "chars" && target.splitInstance.chars) target = target.splitInstance.chars[0];
      else if (splitType === "words" && target.splitInstance.words) target = target.splitInstance.words[0];
      else if (splitType === "lines" && target.splitInstance.lines) target = target.splitInstance.lines[0];
    }

    const propertyType = control.dataset.propertyType

    let rangeValue;

    if (propertyType === "color") {
      // Generated by chatGPT, RegEx to get x from rgba(x, x, x) and rgb(x, x, x)
      rangeValue = /\d+/.exec(gsap.getProperty(target, propertyName))?.[0];
    } else {
      rangeValue = gsap.getProperty(target, propertyName);
    }

    // To animate the controls, you need gsap to get the value in between the keyframes
    control.value = rangeValue;
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
  const newElementId = animationData.createElement(text);

  const target = canvas.querySelector(`#el-${newElementId}`);
  target.contentEditable = true;
  target.focus();
  createSnapshot(animationData);
  selectDefaultText(target); 

}

function selectDefaultText(newElement) {
  const range = document.createRange();    // make an empty marker for some text
  range.selectNodeContents(newElement);    // mark all the text inside newElement

  const selection = window.getSelection();    // Reach for the page's selection — the one highlighter shared by the whole document
  selection.removeAllRanges();  // Erase whatever that highlighter was already highlighting
  selection.addRange(range);    // acctually highlight the text inside newElement
}

function showSelectedText() {
  const target = canvas.querySelector(`#el-${animationData.getSelectedText().id}`);
  if (!target) return;

  target.style.outline = "3px solid #6495ED";
}

canvas.addEventListener("click", (e) => {
  const selected = canvas.querySelector(`#el-${animationData.getSelectedText().id}`);
  if (!selected) return;

  if (selected.contains(e.target)) return;    // If clicked on the selected element, return, DONT clear selectedText

  animationData.clearSelectedText();
});

const originalCanvas = document.querySelector("#original-canvas");
originalCanvas.addEventListener("click", (e) => {        // Event for clearing / deselecting selectedText 
  const selectedText = animationData.getSelectedText(); 
  if (!selectedText || !selectedText.element || !selectedText.id) return;

  if(e.target == originalCanvas) {
    animationData.clearSelectedText(); 
  }; 
})


// -----------------------
// Playhead height fix
// -----------------------

function updatePlayheadHeight() {
  const lastRow = tracksContainer.querySelector('.row:last-of-type');
  let height;

  if (lastRow) {
    // Get the height from the container that needs to be track for the height
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    const rowBottom = lastRow.getBoundingClientRect().bottom;
    const sliderTop = timelineSlider.getBoundingClientRect().top;

    // Divide by eachother so it doesn't get the whole height. Add 20 to make sure it goes a little below the row.
    height = rowBottom - sliderTop;
    timelineSlider.style.setProperty('--height-playhead', ` ${height}px`);
  } else {

    timelineSlider.style.setProperty('--height-playhead', `var(--slider-runnable-track-height)`);
  };
};

// API that tracks if an element changes size
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver 
const observer = new ResizeObserver(updatePlayheadHeight);
const observerHint = new ResizeObserver(updateScrollHint);
observer.observe(tracksContainer);

updatePlayheadHeight();
buildVisualizer();





animationControls.forEach((control) => {
  control.addEventListener("input", (event) => {

    const sliderValue = event.target.value;
    const activePropertyName = event.target.dataset.property;

    let elementId;
    let value;
    let colorValue;

    if (event.target.dataset.propertyType === "color"){
        elementId = animationData.getSelectedText().id;
        colorValue = parseInt(sliderValue);
        value = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    } else {
        elementId = animationData.getSelectedText().id ?? getFirstElementId();
        value = parseFloat(sliderValue);
    }

    if (!elementId) return;

    player.pause();
    playButtonTimeline.textContent = player.isPaused() ? "play" : "pause";

    if (animationData.getElement(elementId).type === "canvas" && event.target.dataset.property !== "backgroundColor") {
      return;
    }



    activeKeyframeId = animationData.setKeyframe(
      elementId,
      activePropertyName,
      player.getProgress(),
      value,
      ease ?? "none",
      currentSplitType
    );


  });

  control.addEventListener("change", () => {
    createSnapshot(animationData);
  });
})




// function getControlValue(control) {
//   const sliderValue = control.value;

//   if (control.dataset.property === "color" || control.dataset.property === "webkitTextStrokeColor" || control.dataset.property === "backgroundColor") {
//     const colorValue = parseInt(sliderValue);
//     return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
//   }

//   return parseFloat(sliderValue);
// }

// // https://gsap.com/docs/v3/GSAP/gsap.getProperty()/
// // https://gsap.com/docs/v3/GSAP/UtilityMethods/splitColor()
// function updateColorInputs() {
//   const elementId = getFirstElementId();
//   if (!elementId) return;

//   const targetId = canvas.querySelector(`.el-${elementId}`);
//   if (!targetId) return;

//   document.querySelectorAll('.animation-control[data-property="color"]').forEach((colorControl) => {
//     const currentColor = gsap.getProperty(targetId, "color");
//     const colorArray = gsap.utils.splitColor(currentColor);
//     // Because we only need grey tints, the r/g/b are all the same number, so we can just use the first (r). 
//     colorControl.value = colorArray[0];
//   });

//   document.querySelectorAll('.animation-control-color[data-property="backgroundColor"]').forEach((bgControl) => {
//     const currentColor = gsap.getProperty(canvas, "backgroundColor");
//     const colorArray = gsap.utils.splitColor(currentColor);
//     bgControl.value = colorArray[0];
//   });
// };

// updateColorInputs();



// Split text controls
const btnSplitNone = document.getElementById("btn-split-none");
const btnSplitChars = document.getElementById("btn-split-chars");
const btnSplitWords = document.getElementById("btn-split-words");
const btnSplitLines = document.getElementById("btn-split-lines");

// Function that executes when a split type button is clicked
function applySplit(type) {
  currentSplitType = type;

  const canvas = document.querySelector(".content-canvas");
  if (canvas) {
    canvas.setAttribute("data-split-type", type);
  }
}

// Add event listeners to split type buttons
if (btnSplitNone) btnSplitNone.addEventListener("click", () => applySplit("none"));
if (btnSplitWords) btnSplitWords.addEventListener("click", () => applySplit("words"));
if (btnSplitChars) btnSplitChars.addEventListener("click", () => applySplit("chars"));
if (btnSplitLines) btnSplitLines.addEventListener("click", () => applySplit("lines"));


// https://www.freecodecamp.org/news/javascript-settimeout-js-timer-to-delay-n-seconds/
// Function to let a hint appear when the container is scrollable. 
// The hint disappears after 5 seconds again.
export function updateScrollHint() {
  const isScrollable = tracksContainer.scrollHeight > tracksContainer.clientHeight;
  scrollHint.hidden = !isScrollable;

  if (isScrollable) {
    clearTimeout(scrollHint.fadeout);
    scrollHint.classList.remove("fade-out");

    scrollHint.fadetimer = setTimeout(() => {
      scrollHint.classList.add("fade-out");
    }, 5000);
  }
}

function createSnapshot(animationData) {
  localStorage.setItem("animationData", animationData.toJSON());
  history.addMemento(animationData.getAnimation());
}


// -----------------------
// Keyframe delete
// -----------------------

document.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") {
    deleteActiveKeyframe();
  }
});

function deleteActiveKeyframe() {
  animationData.deleteKeyframe(activeKeyframeId);
  createSnapshot(animationData);
  buildVisualizer();
}


// -----------------------
// MARK: EDIT PROJECT NAME
// -----------------------
projectNameInput.addEventListener("input", () => {
  projectNameInput.style.width = "0";
  projectNameInput.style.width = Math.min(projectNameInput.scrollWidth, 300) + "px";
});

projectNameInput.addEventListener("blur", () => {
  projectNameText.textContent = projectNameInput.value.trim();

  projectNameText.style.display = "inline";
  projectNameInput.style.display = "none";

  // Apply the name to te animation data
  animationData.setName(projectNameInput.value.trim());

  console.log(animationData.getName());
});

projectNameText.addEventListener("click", () => {
  projectNameInput.style.display = "inline";
  projectNameText.style.display = "none";

  projectNameInput.style.width = "0";
  projectNameInput.style.width = Math.min(projectNameInput.scrollWidth, 300) + "px";

  projectNameInput.focus();
});

projectNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") projectNameInput.blur();
});

// -----------------------
// Save animation
// -----------------------

saveButton.addEventListener("click", () => {
  downloadAnimation();
});

function downloadAnimation() {
  const projectName = animationData.getName() || "animation";
  const zip = new JSZip();

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = isDarkMode ? "dark" : "light";

  zip.file("animation.json", animationData.toJSON());
  zip.file("index.html", buildStandaloneHTML(projectName, animationData.toJSON(), currentTheme));

  zip.generateAsync({ type: "blob" }).then(function (blob) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}.zip`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// -----------------------
// Standalone HTML
// -----------------------
function buildStandaloneHTML(projectName, animationJSON, savedTheme = 'light') {

  const lightColors = `
        --color-bg-canvas: #F2F1F3;
        --color-bg-container: #FFFFFF;
        --color-bg-topbar: #2B2B2B;
        --color-text-one: #F2F2F2;
        --color-text-two: #2B2B2B;
        --color-text-three: #888;
        --color-border-button: #F2F2F2;
        --color-border-container: rgba(200, 200, 200, 0.4);
        --color-border-canvas: #CCCCCC;
        --color-border-item: rgba(200, 200, 200, 0.4);
        --color-boxshadow-one: rgba(0, 0, 0, 0.1);
        --color-details-one: #6495ED;
        --color-details-two: #FF1493;
        --color-hover-one: #4C78D0;
        --color-hover-two: rgba(200, 200, 200, 0.4);
        --color-bar: #eaeaea;
        --color-track: #dde7fa;
        --color-resize: #cbcaca;
        --color-button: #eaeaea;
  `;

  const darkColors = `
        --color-bg-canvas: #2d2d2f;
        --color-bg-container: #1A1A1C;
        --color-bg-topbar: #1A1A1C;
        --color-text-one: #F0F0F0;
        --color-text-two: #E2E2E2;
        --color-text-three: #a9a9a9;
        --color-border-button: #494949;
        --color-border-container: rgba(255, 255, 255, 0.08);
        --color-border-canvas: #3A3A3A;
        --color-border-item: rgba(255, 255, 255, 0.08);
        --color-boxshadow-one: rgba(0, 0, 0, 0.35);
        --color-details-one: #6495ED;
        --color-details-two: #b50c66;
        --color-hover-one: #4C78D0;
        --color-hover-two: rgba(255, 255, 255, 0.08);
        --color-bar: #2E2E30;
        --color-track: #2e3e5e;
        --color-resize: #3D3D3F;
        --color-button: #2E2E30;
  `;

  const activeColors = savedTheme === 'dark' ? darkColors : lightColors;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/SplitText.min.js"></script>

  <title>${projectName}</title>

  <style>
    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
    }

    :root {
        color-scheme: ${savedTheme};
        
        ${activeColors}
    }

    body {
        font-family: "Inter", sans-serif;
        background-color: var(--color-bg-canvas);
        color: var(--color-text-two);

        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }

    .content-canvas {
        width: 35em;
        aspect-ratio: 1/1;

        background-color: var(--color-bg-container);
        border: .75px solid var(--color-border-canvas);
        position: relative;
        overflow: clip;
    }

    .canvas {
        width: 100%;
        height: 100%;
        position: relative;
    }

    h2 {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        white-space: preserve nowrap;
        margin: 0;
    }

    .split-char,
    .split-word,
    .split-line {
        display: inline-block;
    }
  </style>
</head>
<body>
  <div class="content-canvas">
    <div class="canvas"></div>
  </div>

  <!-- Animation data, embedded so it works without a server (file:// has no fetch access) -->
  <script type="application/json" id="animation-data">${animationJSON}</script>

  <script>
    gsap.registerPlugin(SplitText);

    function loadAnimation() {
      const raw = document.getElementById("animation-data").textContent;
      return JSON.parse(raw);
    }

    function buildElements(canvas, elements) {
      const elementMap = new Map();

      for (const [id, text] of Object.entries(elements)) {
        const el = document.createElement("h2");
        el.classList.add(\`el-\${id}\`);
        el.textContent = text;
        canvas.appendChild(el);

        const split = new SplitText(el, {
          type: "chars, words, lines",
          charsClass: "split-char",
          wordsClass: "split-word",
          linesClass: "split-line"
        });
        el.splitInstance = split;

        elementMap.set(id, el);
      }

      return elementMap;
    }

    function buildTimeline(data, elementMap) {
      const duration = data.duration;

      const timeline = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatRefresh: true
      });

      timeline.add(gsap.delayedCall(duration, () => {}));

      for (const [targetId, properties] of Object.entries(data.animations)) {
        const domElement = elementMap.get(targetId);
        if (!domElement) continue;

        for (const [propertyName, keyframes] of Object.entries(properties)) {
          if (!keyframes.length) continue;

          // Set (and re-set on each loop, via repeatRefresh) the first keyframe value
          timeline.set(
            \`.el-\${targetId}\`,
            {
              [propertyName]: keyframes[0].value,
              ease: keyframes[0].ease ?? "none",
            },
            0
          );

          for (let i = 1; i < keyframes.length; i++) {
            const last = keyframes[i - 1];
            const current = keyframes[i];

            let timeDifferenceSeconds = (current.progress - last.progress) * duration;

            let animationTarget = \`.el-\${targetId}\`;
            let staggerConfig = null;

            const kfSplitType = current.splitType || "none";

            if (kfSplitType !== "none") {
              animationTarget = domElement.splitInstance[kfSplitType];

              staggerConfig = {
                amount: timeDifferenceSeconds * 0.5,
              };

              timeDifferenceSeconds = timeDifferenceSeconds * 0.5;
            }

            timeline.to(
              animationTarget,
              {
                [propertyName]: current.value,
                duration: timeDifferenceSeconds,
                ease: current.ease ?? "none",
                stagger: staggerConfig,
              },
              last.progress * duration
            );
          }
        }
      }

      return timeline;
    }

    (function init() {
      const data = loadAnimation();
      const canvas = document.querySelector(".canvas");

      const elementMap = buildElements(canvas, data.elements);
      const timeline = buildTimeline(data, elementMap);

      timeline.play();
    })();
  </script>
</body>
</html>`;
}


const loadButton = document.querySelector(".load-button");
const loadInput = document.querySelector("#load-input");

loadButton.addEventListener("click", () => {
  loadInput.click();
});

loadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const json = event.target.result;
    const success = animationData.fromJSON(json);

    if (success) {
      history.clear();
      createSnapshot(animationData);

      // Reset UI state tied to the previous animation
      activeKeyframeId = null;
      activeElementId = null;
      activePropertyName = null;
      activeValue = null;

      // Update project name display
      projectNameText.textContent = animationData.getName();

      // Sync timeline end time input with the loaded duration
      endTimeInput.value = animationData.getDuration().toFixed(2);

      buildVisualizer();
      updateRangeInputs();
      showSelectedText();
    } else {
      alert("Could not load animation: invalid file.");
    }
  };

  reader.readAsText(file);

  // Reset the input so the same file can be selected again later
  loadInput.value = "";
});