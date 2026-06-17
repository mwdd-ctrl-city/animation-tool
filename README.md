# (Inter)play - Animation Tool

Welcome to the (Inter)play Animation Tool. This tool was designed and developed for Marjolijn Ruijg, enabling her within her Professional doctorate (PD) project to generate typographic interactive animations for various concepts from the glossary, using only typography or graphic elements.

## Table of Contents
- [About this Project](#about-this-project)
- [Browser Compatibility](#browser-compatibility)
- [Features](#features)
- [For end users](#for-end-users)
- [For developers](#for-developers)
- [Embedding an Animation into Your Website](#embedding-an-animation-into-your-website)
- [File Structure](#file-structure)
- [JSON Structure](#json-structure)
- [Recommendations](#recommendations)
- [Collaborators](#collaborators)
- [License](#license)

## About this Project
The goal of this tool is to make it easier to create animations for specific terms from Marjolijn Ruijg's PD project, *(Inter)facing the Hybrid City*. The tool was developed to support the visual exploration and communication of key concepts within the research.

Several requirements guided the deisgn and development of the project:  
- The visual style had to use black and white or grayscale gradients
- The typography had to use the Inter typeface, with Courier as an alternative where appropriate.
- Animations needed to be exportable so they could be downloaded and reused in other contexts.
- The final product was designed specifically for use on laptops and was not optimized for mobile devices.

This project was designed and developed between May and June 2026 by students from the Communication and Multimedia Design (CMD) program at the Amsterdam University of Applied Sciences. The project was completed in June, but may be further developed in the future.


## Browser Compatibility?
The animation tool was primarily developed and tested in Google Chrome, which providees the best adn most stable user experience. For this readon, Google Chrome is the recommended browser for using the tool.

The tool has also been tested and found to work on the following browsers:
- Safari 
- Microsoft Edge

The Tool is not compatible with firefox and may not function correctly in this browser. 

Other browsers were not tested during the development period.

## Features
In the tool there are different functionalities: 
- Save/Export the animation
- Import the animation to work furhter
- Undo/redo functionality
- Clear canvas
- Timeline with keyframes
- Play and pause button
- Change duration
- Scrubb the playhead
- Drag the text on the canvas
- Watch a preview

Animation functionalities:
- Font-size
- Font-weight
- Opacity of the font
- Line height
- Color of text
- Outline color and width
- Background color
- Transform scaleX and ScaleY
- Transform skewX and SkewY
- Rotation X, Y
- Direction of the text
- Splittype
- Animation ease
- Delete an element

<img width="1596" height="878" alt="cheatsheet-animation-tool" src="https://github.com/user-attachments/assets/eae4bcc5-bae7-499f-be07-b8b1b227626c" />

## For end users
Open the following link in your browser:
[Open the Animation Tool](https://mwdd-ctrl-city.github.io/animation-tool/)

### Using the tool
#### Step 1
Start by clicking the "T" to add a text field to the canvas. In the text field, type your own word or text.

Or, to add an emoji or another symbol:

1. Control + Command + Spacebar (Mac) or Windows-key + . or ; (Windows)
2. Click the arrow in the bottom-right corner to browse more graphical symbols.

#### Step 2
Select the text you entered by clicking on it and adjust its styling using the right-hand panel. The selected text has a blue outline.

#### Step 3
As you adjust the styling, small squares will appear on a blue track in the bottom panel. These are keyframes. To create an animation, you need at least two keyframes on the same blue track.

Drag the keyframes left or right to adjust the timing of the animation.

#### Step 4
Do you have a track with keyframes that you're not satisfied with? Click on the name of the keyframe and then click the cross icon that appears on the left side of the element to remove it.

#### Step 5
Finished and satisfied with your animation? Give your project a name at the top of the screen and save it. You will receive a ZIP file.

The ZIP file contains:

```bash
# Filename revers to the name you gave to your files.
├── 📄 filename.html                       # Open this file to preview the animation.
├── 📄 filename.json                       # Import this file back into the tool to edit the animation.
```

## For developers
### For Development and Modifications
Open Visual Studio Code and launch the terminal within the project.

```bash
# 1. Clone the Repository
# Clone the repository by pasting the following command into the terminal
git clone https://github.com/mwdd-ctrl-city/animation-tool.git

# 2. Change Directory
# Navigate to the project folder
cd animation-tool
```
<!-- Net iets anders omschrijven eerst extension en dan go live -->
Open the project in Visual Studio Code and click **"Go Live"** in the bottom-right corner to launch the local development version. In order to see the live preview, the user had to install the Live Server extension (by Ritwick Dey).


<!-- 
This needs to be tested first

## Embedding an Animation into Your Website
Requirements:
- A ZIP file exported from the Animation Tool
- A website built with Astro

Steps:
1. Open the source code of your website.
2. Navigate to `public -> src -> animations`.
3. Create a new file with your preferred filename, for example: `animation-name.astro`.
4. Open the ZIP file 
5. Copy the code from the `.html` file and paste it into the newly created Astro file. -->

## File Structure
```bash
├── 📁 assets/                             # Static files (images, fonts)
│   ├── 📁 fonts/                          # Fonts
│   ├── 📁 icon/                           # Icons
├── 📁 scripts/                            # JavaScript
│   ├── 📁 animation/                      # Animation logic
│       └── 📄 animation.js                # Domain logic
│       └── 📄 animation-player.js         # GSAP integration
│   ├── 📁 memento/                        # History logic
│        └── 📄 history.js                 # Undo and redo functionality
│   ├── 📁 libraries/                      # Libraries
│        └── 📄 jszip.js                   # Library to save code into a Zip
│   ├── 📄 main-layout.js                  # General layout functionality
│   ├── 📄 preview.js                      # Preview functionality
│   ├── 📄 timeline.js                     # Timeline panel functionality
├── 📁 styles/                             # Styling
│   └── 📄 main-layout.css                 # Panel styling
│   └── 📄 style.css                       # General styling utilities
│   └── 📄 timeline.css                    # Timeline styling
├── 📄 index.html                          # Main HTML file
├── 📄 .gitignore                          # Git ignore rules
├── 📄 LICENSE                             # Open-source license
└── 📄 README.md                           # Main project documentation
```

## JSON Structure
The *animation.js* is the fundament of the json, within this file the json is made. This structure contains all information required to generate and render an animation, including its name, duration, elements, and animation keyframes.

### Main Properties
- Name: the name of the animation
- Duration: total duration of the animation in seconds
- Elements: A collection ot al elements (texts) that appear int he animation.
- Animations: Contains the properties and keyframes for each element.

### Elements
Each element is identified by a unique ID and contains:
- Content: The text object what the user gave the element
- Type: The type of element, such as *text* or *canvas*.

### Animations 
The *animations* object links animation properties to a specific element ID. In this example, the text element receives a *rotate* animation.

Each animation consists of keyframes containing: 
- ID: A unique identifier for the keyframe. Which corresponts with the element ID.
- Progress: The position of the keyframe within the animation timeline, because of GSAP ranging from *0*(start) to *1* (end).
- Value: The value that you got from the animated property.
- Ease: The function applied between the keyframes.

### Example

``` json
{
    "name": "Recursivity Animation",
    "duration": 5,
    "elements": {
        "31918104-d817-4ff2-9b5a-7b81e5daa0a8": {
            "content": "Recursivity",
            "type": "text"
        },
        "31918104-d817-4ff2-9b5a-7b81e5daa0a7": {
            "content": "canvas",
            "type": "canvas"
        }
    },
    "animations": {
        "31918104-d817-4ff2-9b5a-7b81e5daa0a8": {
            "rotate": [
                {
                    "id": "31918104-d817-4ff2-9b5a-7b81e5daa0a7",
                    "progress": 0,
                    "value": 0,
                    "ease": "none"
                },
                {
                    "id": "31918104-d817-4ff2-9b5a-7b81e5daa0a6",
                    "progress": 1,
                    "value": 0,
                    "ease": "none"
                }
            ]
        }
    }
}
```
In this example, the text element "Recursivity" is animated using a rotation property. The animation starts at a progress of 0 and a value of 0. This is the startpoint. And the the animation ends at a progress of 1 and a value of 0. This indicates that they start and end at the same point.

## Recommendations
Some of the recommendations we had that could possibly improve the project:

### Known issues
Some issues that have been identified for future development:
- When using the tool on a windows devices, the default browser scrollbar may appear visible and can visually inconsistent with the overall design application.


### Enhancements
Some improvements have been identified for future development:
- Keep the standalone build synchronized with the changes made to the main application.
- Impove the off-canvas text selection functionality
- Refactor and split *timeline.js* into smaller modules to improve the code maintainability.



## Collaborators

| Role             | Name            | 
|------------------|-----------------|
| Client           | Marjolijn Ruijg |
| Development Team | Mila Massaro    | 
| Development Team | Kerr Beeldens   | 
| Development Team | Senna Hoving    | 
| Development Team | Jeppe de Wilde  | 
| Development Team | Sabrina Zuurbier| 

## License
[MIT / Internal use / No reuse without permission]

© 2026 mwdd-ctrl-city

## Sources

### Fonts
- https://fonts.google.com/specimen/Inter?preview.script=Latn
- https://fonts.google.com/specimen/Courier+Prime?preview.script=Latn

### GSAP
- https://gsap.com/docs/v3/GSAP/Timeline/
- https://gsap.com/docs/v3/Installation/?tab=cdn&module=esm&require=false
- https://gsap.com/docs/v3/GSAP/gsap.set()/
- https://gsap.com/docs/v3/Plugins/Draggable/ 
- https://youtu.be/L1afzNAhI40?si=M-FbxvaYEhYHRBgb 

### JavaScript
- https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
- https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- https://developer.mozilla.org/en-US/docs/Web/API/Element/hasPointerCapture
- https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
- https://dev.to/avinash_tare/how-to-detect-if-a-user-is-in-dark-mode-in-js-5hhp
- https://www.freecodecamp.org/news/javascript-settimeout-js-timer-to-delay-n-seconds/
- https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
- https://medium.com/@artemkhrenov/the-memento-pattern-in-javascript-state-preservation-made-simple-9ef1e7705651

### Library
- https://github.com/nodeca/pako/blob/main/LICENSE
- https://raw.github.com/Stuk/jszip/main/LICENSE.markdown
- <http://stuartk.com/jszip>

### CSS
- https://www.a11yproject.com/posts/how-to-hide-content/ 
- https://www.youtube.com/watch?v=Vzj3jSUbMtI

### AI <em>(also mentioned in the code itself when used.)</em>
- https://chatgpt.com/
- https://claude.ai/new
- https://gemini.google.com/app?hl=nl
