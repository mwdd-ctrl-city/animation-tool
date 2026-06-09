import { player } from "./timeline.js";
import AnimationPlayer from "./animations/animation-player.js";
import {animationData} from "./timeline.js";

// ----------------------------------
// MARK: PREVIEW CANVAS
// ----------------------------------

console.log(animationData)

const popover = document.querySelector('#popover-original');

document.getElementById('open-button').addEventListener('click', () =>{
    const orginalCanvas = document.querySelector('#original-canvas');
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
    // Makes a clone from the html attribute 
    const popoverCanvas = orginalCanvas.cloneNode(true);

    popoverCanvas.removeAttribute('id');

    // Put the clone inside the popover attribute.
    const popoverContent = document.querySelector('#popover-content');
    popoverContent.innerHTML = '';
    popoverContent.appendChild(popoverCanvas)

    player.play();
});
