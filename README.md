# (Inter)play - Animation Tool

Welcome to the (Inter)play Animation Tool. This tool was designed and developed for Marjolijn Ruijg, enabling her within her Professional Development (PD) project to generate typographic interactive animations for various concepts from the glossary, using only typography or graphic elements.

## Table of Contents
- [About this Project](#about-this-project)
- [Requirements](#requirements)
- [Browser Compatibility](#browser-compatibility)
- [Features](#features)
- [Installation](#installation)
- [First-Time Use](#first-time-use)
- [Embedding an Animation into Your Website](#embedding-an-animation-into-your-website)
- [File Structure](#file-structure)
- [Recommendations](#recommendations)
- [Contact Persons](#contact-persons)
- [License](#license)

## About this Project
The goal of this tool is to make it easier to create animations for specific terms from Marjolijn Ruijg's PD project, *(Inter)facing the Hybrid City*.

This project was designed and developed between May and June 2026 by students from the Communication and Multimedia Design (CMD) program at the Amsterdam University of Applied Sciences. The project was completed in June, but may be further developed in the future.

Designers/Developers:
- Jeppe de Wilde
- Mila Massaro
- Kerr Beeldens
- Senna Hoving
- Sabrina Zuurbier

## Requirements
No additional software is required to install or use this tool.

Only requirement is a working laptop.

## Browser Compatibility?
The best working browser for this animation tool is Google Chrome.

But it's also working in the browsers:
- Safari 

## Features?
In the tool there are different funcitonalities: 
<img width="1596" height="878" alt="cheatsheet-animation-tool" src="https://github.com/user-attachments/assets/eae4bcc5-bae7-499f-be07-b8b1b227626c" />


## Installation
### For Personal Use
Open the following link in your browser:
[Open the Animation Tool](https://mwdd-ctrl-city.github.io/animation-tool/)

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

## First-Time Use
### Using the Tool
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

### For Development
Open the project in Visual Studio Code and click **"Go Live"** in the bottom-right corner to launch the local development version. In order to see the live preview, the user had to install the Live Server extension (by Ritwick Dey).

## Embedding an Animation into Your Website

Requirements:
- A ZIP file exported from the Animation Tool
- A website built with Astro

Steps:
1. Open the source code of your website.
2. Navigate to `public -> src -> animations`.
3. Create a new file with your preferred filename, for example: `animation-name.astro`.
4. Open the ZIP file 
5. Copy the code from the `.html` file and paste it into the newly created Astro file.

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
│   ├── 📄 animation.json                  # Template of the json: This isn't necessary for the animation to work
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

## Recommendations
Some of the recommendations we had that could possibly improve the project:
-
aLs je iets aanpast moet je het ook aanpassen in de standalonbuild


## Contact Persons

| Role             | Name            | Contact              |
|------------------|-----------------|----------------------|
| Client           | Marjolijn Ruijg | name@organisation.nl |
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

### JavaScript
- https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
