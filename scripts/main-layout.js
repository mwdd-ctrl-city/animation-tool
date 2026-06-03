// ---------------
// MARK: CONSTANTS
// ---------------
const projectNameText = document.getElementById("project-name");
const projectNameInput = document.getElementById("project-name-input");

const contentContainer = document.querySelector('.content-panel');
const contentCanvas = document.querySelector('.content-canvas');

const timelineContainer = document.querySelector(".timeline-panel");
const itemsContainer = document.querySelector(".items-panel");
const resizeHandleTop = document.querySelector(".handle-top");
const resizeHandleLeft = document.querySelector(".handle-left");

// ---------------
// MARK: VARIABLES
// ---------------
let startY;
let startX;
let startHeight;
let startWidth;
let isDragging = false;
let contentX = 0;
let contentY = 0;
let contentScale = 1;


// -----------------------
// MARK: EDIT PROJECT NAME
// -----------------------
projectNameText.addEventListener("click", () => {
    projectNameInput.style.display = "inline";
    projectNameText.style.display = "none";

    projectNameInput.focus();
});

projectNameInput.addEventListener("blur", () => {
    projectNameText.textContent = projectNameInput.value;

    projectNameText.style.display = "inline";
    projectNameInput.style.display = "none";
});



// ----------------------------------
// MARK: TIMELINE DRAGGABLE CONTAINER
// ----------------------------------
// ** Functions for items **
resizeHandleLeft.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = itemsContainer.offsetWidth;

    resizeHandleLeft.setPointerCapture(e.pointerId);
});


resizeHandleLeft.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    
    const deltaX = startX - e.clientX;
    let newWidth = startWidth + deltaX;

    // Determine max and min width, to change the cursor (UI)
    // getComputedStyle returns pixel values, with parseFloat it gives a number.
    const minWidth = parseFloat(getComputedStyle(itemsContainer).minWidth);
    const maxWidth = parseFloat(getComputedStyle(itemsContainer).maxWidth);

    if (newWidth < minWidth || newWidth > maxWidth) {
        resizeHandleLeft.style.cursor = "default";
        newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth); // clamp instead of return
    } else {
        resizeHandleLeft.style.cursor = "ew-resize";
    }

    gsap.set(itemsContainer, {
        width: newWidth
    });

    document.documentElement.style.setProperty("--size-items", newWidth + "px");
});


resizeHandleLeft.addEventListener("pointerup", (e) => {
    // Makes sure the resizeHandleLeft has the CSS style given (inline style removed)
    resizeHandleLeft.style.cursor = "";
    // Stop reacting to mouse- and touch movements on this element.
    resizeHandleLeft.onpointermove = null;
    isDragging = false;
});


// ** Functions for timeline **
resizeHandleTop.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startY = e.clientY;
    startHeight = timelineContainer.offsetHeight;
    startScrollTop = itemsContainer.scrollTop;

    // Is used to designate a specific element as the capture target of future pointer events.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
    resizeHandleTop.setPointerCapture(e.pointerId);
});

resizeHandleTop.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    let newHeight = startHeight + deltaY;

    gsap.set(timelineContainer, {
        height: newHeight
    });

    document.documentElement.style.setProperty("--size-timeline", newHeight + "px");



    if (startScrollTop > 0) {
        itemsContainer.scrollTop = startScrollTop + deltaY;
    }
});

resizeHandleTop.addEventListener("pointerup", (e) => {
    // Stop reacting to mouse- and touch movements on this element.
    resizeHandleTop.onpointermove = null;
    isDragging = false;
});



// ------------------------
// MARK: CONTENT AND CANVAS
// ------------------------

// Returns the size and position of an element relative to the viewport - when page loads
const rect = contentContainer.getBoundingClientRect();
contentX = (rect.width - 800) / 2;
contentY = (rect.height - 800) / 2;

// https://gsap.com/docs/v3/GSAP/gsap.set()/
// Immediately sets properties of the targets accordingly.
gsap.set(contentCanvas, { x: contentX, y: contentY });

// https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event 
// With holding the control key, you can zoom in when scrolling down or you can "pinch" fingers together.
contentContainer.addEventListener('wheel', e => {
    e.preventDefault();


    if (e.ctrlKey) {
        let zoomContent;
        if (e.deltaY < 0) {
            zoomContent = 1.1;
        } else {
            zoomContent = 0.9;
        }

        const rect = contentContainer.getBoundingClientRect();
        // e.clientX: cursor's distance from the left edge of the whole page
        // With rect.left: the distance from left edge of the container (not the whole page)
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        contentX = mouseX - (mouseX - contentX) * zoomContent;
        contentY = mouseY - (mouseY - contentY) * zoomContent;
        contentScale = contentScale * zoomContent;
    } else {
        contentX = contentX - e.deltaX;
        contentY = contentY - e.deltaY;
    }

    gsap.to(contentCanvas, {
        x: contentX,
        y: contentY,
        scale: contentScale,
        duration: 0.05,
        ease: "none"
    });
}, { passive: false });