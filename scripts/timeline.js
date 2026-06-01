import AnimationBuilder from "./animation-builder.js";

const timelineSlider = document.querySelector("#timeline-slider");
const playButtonTimeline = document.querySelector(".play-animation");
const animationControls = document.querySelectorAll(".animation-control");
const tracksContainer = document.querySelector('.timeline-container');
const canvas = document.querySelector(".canvas");

const textInput = document.getElementById("input-text");
const textButton = document.getElementById('input-button');

const numberInput = document.getElementById('numberInput');
const duplicateBtn = document.getElementById('duplicateBtn');

// Create the animationbuilder with the given container to animate with a default timeline of 5 seconds
const animationBuilder = new AnimationBuilder(canvas, 5);

// Load in the JSON data from a file (TODO: later this should become user controllable)
animationBuilder.loadAnimation("./scripts/animation.json");

// When the animation automatically plays the slider updates on the progress of the animation duration
animationBuilder.setOnUpdateListener((timeline) => {
  timelineSlider.value = timeline.progress() * 100;

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
    animationBuilder.setKeyframe(animationBuilder.selectedText, propertyName, value);
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


// Data in the animationBuilder has changed
animationBuilder.addEventListener("updateAnimation", () => {
  buildVisualizer();
});

function buildVisualizer() {
  const visualizerContainer = document.querySelector(".timeline-container");
  visualizerContainer.innerHTML = ""

  // Get the animationData from the animationBuilder
  const timelineData = animationBuilder.timelineData;

  // Get the data from the json
  timelineData.animations.forEach((animationData) => {
    animationData.properties.forEach((propertyData) => {

      // Create elements to create for each functionality a row
      const row = document.createElement("div");
      row.classList.add("row");

      const track = document.createElement("div");
      track.classList.add("track");

      const trackText = document.createElement("p");
      trackText.classList.add("track-label");

      row.append(trackText, track)

      trackText.innerHTML = `<span>${propertyData.property}</span>`;

      // Create for each keyframe point a point on the row
      propertyData.keyframes.forEach((keyframe) => {
        const point = document.createElement("div");
        point.classList.add("keyframe");
        point.style.setProperty("--p", keyframe.progress);
        track.appendChild(point);

        // Create a drag for the keyframe and update the value
        Draggable.create(point, {
          // Type of way you can dragg the element on the x axis
          type: 'x',
          bounds: track,
          onDragEnd() {
            const trackWidth = track.offsetWidth;
            const pointX = this.x + (trackWidth * keyframe.progress);
            const toProgress = Math.max(0, Math.min(1, pointX / trackWidth));

            animationBuilder.moveKeyframe("el-1", propertyData.property, keyframe.progress, toProgress);
          }
        });
      });

    // Add the elements to the html
      visualizerContainer.appendChild(row);
    });
  });
};

function updateRangeInputs () {
  const animations = animationBuilder.timelineData.animations;
  const currentProgress = animationBuilder.getProgress();
  

  // Search for all the controls 
  animationControls.forEach((control) => {
    const propertyName = control.dataset.property

    //First search for the animation in JSON
    const animation = animations.find(
      (animation) => animation.target === "el-1" //TODO ook voor andere stukken tekst die je dan selecteerd aanpassen. 
    );

    if (!animation) {
      // Let the rangevalue be 0
      control.value = 0;
      return;
    }

    //Second look for the property in JSON
    const property = animation.properties.find(
      (property) => property.property === propertyName
    );

    if (!property) {
      control.value = 0;
      return;
    }

    const target = document.querySelector(".el-1");
    const currentValue = gsap.getProperty(target, propertyName)

    control.value = currentValue
  })
}

// PLayhead element on the timeline increases it/s length when the a track is added
function updatePlayheadHeight() {
  // Get the height from the container that needs to be trackt for the height
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const containerBottom = tracksContainer.getBoundingClientRect().bottom;
  const sliderTop = timelineSlider.getBoundingClientRect().top;

  // Devide by eachother so it doesn't get the wholee height
  const height = containerBottom - sliderTop;
  timelineSlider.style.setProperty('--height-playhead', `${height}px`);
}

// API that tracks if an element changes size
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver 
const observer = new ResizeObserver(updatePlayheadHeight);
observer.observe(tracksContainer);

updatePlayheadHeight();
textButton.addEventListener("click", () => {
  if(textInput.value === "") return; 
  addText(textInput.value); 
})

//Add input value with enter key
textInput.addEventListener('keypress', (event) => {
  if(textInput.value === "") return; 

  if (event.key === 'Enter') {
    addText(textInput.value); 
  }
});

function addText(text) {
    animationBuilder.setText(text); 
    textInput.value = ''; //Clear input field
}

// Duplicate text with button
duplicateBtn.addEventListener('click', () => {
  // select the elemenent you want to dubplicate the text of
    const selectedItem = document.querySelector(".el-1");

    // Check if element exists
    if (!selectedItem) {
        return;
    }
    
    // Get the number, if not a number or less than/equal to 0 return
    const number = parseInt(numberInput.value, 10);
    if (isNaN(number) || number <= 0) return;

    if (!selectedItem.dataset.originalText) {
        selectedItem.dataset.originalText = selectedItem.textContent;
    }

    // Use the original text content as the basis for duplication
    const originalText = selectedItem.dataset.originalText;

    // Add the original text to the element the specified number of times
    for (let i = 0; i < number; i++) {
        selectedItem.textContent += " " + originalText;
    }

    numberInput.value = '';
});