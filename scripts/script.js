const canvas = document.querySelector('.canvas');
const directionSelect = document.getElementById('animation-direction');

// Function that executes when the value of the direction select changes
directionSelect.addEventListener('change', (e) => {
    // Get chosen direction from the select
    const gekozenRichting = e.target.value;
    
    // Remove all direction classes 
    canvas.classList.remove('dir-normal', 'dir-left', 'dir-right', 'dir-reverse');
    
    // Add the class of the chosen direction
    canvas.classList.add(`dir-${gekozenRichting}`);
});

// Set inital direction to normal
canvas.classList.add('dir-normal');