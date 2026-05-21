
// https://gsap.com/docs/v3/GSAP/Timeline/
// Define the timeline
const timeline = gsap.timeline({
    paused: true, //Making timeline that starts paused
    onUpdate: ()=>{ //When the animation automatically plays the slider updates on the progress of the animation duration
        if(timelineSlider) {
            timelineSlider.value = timeline.progress() * 100
        }
    },
});

// Define animation (this is a placeholder to try the slider functionality)
timeline.to(".text",{
    x: 400, //Translate
    rotation: 360, //Rotate
    duration: 3, //Duration
    ease: "none", //No ease
});

// Connect the interface to the engine
const timelineSlider = document.querySelector("#timeline-slider");

// Get play button
const playButtonTimeline = document.querySelector('.play-animation');

// create the update when input changes
timelineSlider.addEventListener("input", ()=> {
    const progressTimeline = timelineSlider.value / 100;

    timeline.progress(progressTimeline);
});

// To play/pause the whole animation at once
let isPlaying = false; //Standard is false

playButtonTimeline.addEventListener("click", ()=> {
    if(isPlaying === false) {
        timeline.play();
        playButtonTimeline.textContent = 'Pause';
        isPlaying = true;
    } else {
        timeline.pause();
        playButtonTimeline.textContent = 'Play';
        isPlaying = false;
    }
})

