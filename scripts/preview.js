import { player } from "./timeline.js";
import AnimationPlayer from "./animations/animation-player.js";
import {animationData} from "./timeline.js";

// ----------------------------------
// MARK: PREVIEW CANVAS
// ----------------------------------

const popover = document.querySelector('#popover-original');

document.getElementById('open-button').addEventListener('click', () =>{
    const orginalCanvas = document.querySelector('#original-canvas');
    const closeButton = document.querySelector('.close-button');

    // https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
    // Makes a clone from the html attribute
    const popoverCanvas = orginalCanvas.cloneNode(true);

    //To avoid having the two same id's in the html(because of the clone)
    popoverCanvas.removeAttribute('id');

    // Put the clone inside the popover attribute.
    const popoverContent = document.querySelector('#popover-content');
    popoverContent.innerHTML = '';
    popoverContent.appendChild(popoverCanvas);

    // Make a temorary new previewplayer 
    const previewPlayer = new AnimationPlayer(popoverCanvas, animationData);
    previewPlayer.play({loop:true}); //Set the player on a loop

    // Enable the whole loop bij pausing the animation of the preview player and set the loop on false
    closeButton.addEventListener('click', () => {
        previewPlayer.pause({ loop: false });
    })
});