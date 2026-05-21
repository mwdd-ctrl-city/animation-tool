
// https://gsap.com/docs/v3/GSAP/Timeline/

// Connect the interface to the engine
const timelineSlider = document.querySelector("#timeline-slider");

// Get play button
const playButtonTimeline = document.querySelector('.play-animation');

// Define the timeline
const timeline = gsap.timeline({
    paused: true, //Making timeline that starts paused
    onUpdate: ()=>{ //When the animation automatically plays the slider updates on the progress of the animation duration
        if(timelineSlider) {
            timelineSlider.value = timeline.progress() * 100
        } 
    },
    repeat: -1 //Loop the animation
});

let keyframes = [
    { progress: 0, x: 0, rotation: 0, scaleY: 1 }, // progress 0%
    { progress: 1, x: 0, rotation: 0, scaleY: 1 }  // progress 100%
];

// animation builder
function buildAnimation() {
    // store current progress before clearing the timeline so it can be set back after rebuilding
    const currentProgress = timeline.progress() || 0;

    // set timeline back to current progress after rebuilding
    timeline.progress(currentProgress);

    // clear the timeline
    timeline.clear();

    // order keyframes by progress
    keyframes.sort((a, b) => a.progress - b.progress);

    // set initial state of the animation to the first keyframe
    gsap.set(".text", { 
        x: keyframes[0].x, 
        rotation: keyframes[0].rotation, 
        scaleY: keyframes[0].scaleY 
    });

    const totalDuration = 3;

    // loop through keyframes and create timeline segments based on the time difference between keyframes
    for (let i = 1; i < keyframes.length; i++) {
        let last = keyframes[i - 1];
        let current = keyframes[i];
        
        // calculate time difference between current and last keyframe
        let timeDifference = (current.progress - last.progress) * totalDuration;
        
        timeline.to(".text", {
            x: current.x,
            rotation: current.rotation,
            scaleY: current.scaleY,
            duration: timeDifference,
            ease: "none",
        });
    }
};

// Controls
const animationControls = document.querySelectorAll(".animation-control");

animationControls.forEach(control => {
    control.addEventListener('input', (event) => {
        const propertyName = event.target.dataset.property;
        const newValue = parseFloat(event.target.value);
        
        // round current time to 2 decimal to avoid precision issues
        const currentTime = Math.round(timeline.progress() * 100) / 100;

        // check if there's already a keyframe at the current time
        let keyframe = keyframes.find(kf => kf.progress === currentTime);

        // make new keyframe is there isn't one at the current time
        if (!keyframe) {
            keyframe = {
                progress: currentTime,
                // get current values of the properties
                x: gsap.getProperty(".text", "x"),
                rotation: gsap.getProperty(".text", "rotation"),
                scaleY: gsap.getProperty(".text", "scaleY")
            };
            keyframes.push(keyframe);
        }

        // update value of the property in the keyframe
        keyframe[propertyName] = newValue;

        buildAnimation();
    });
});

// Initial build of the animation
buildAnimation();

// create the update when input changes
timelineSlider.addEventListener("input", ()=> {
    const progressTimeline = timelineSlider.value / 100;

    timeline.progress(progressTimeline);
});

// To play/pause the whole animation at once
let isPlaying = false; //Standard is false

playButtonTimeline.addEventListener("click", ()=> {

    // reset timeline to beginning if it has reached the end
    if(timeline.progress() === 1) {
        timeline.progress(0);
    }
    if(isPlaying === false) {
        timeline.play();
        playButtonTimeline.textContent = 'Pause';
        isPlaying = true;
    } else {
        timeline.pause();
        playButtonTimeline.textContent = 'Play';
        isPlaying = false;
    }
});

