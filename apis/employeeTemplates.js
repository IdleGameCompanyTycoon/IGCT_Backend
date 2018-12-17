// For special skills
const gameDevSkills = {
  gameDesign: 0.5,
  soundDesign: 0.5,
  levelDesign: 0.5,
  action: 0.5,
  shooter: 0.5,
  strategie: 0.5,
  rpg: 0.5,
  tactics: 0.5,
  simulaton: 0.5,
  tycoon: 0.5,
}

// Templates
const softwareDevSkills = {
  network: 0.5,
  uiDev: 0.5,
  server: 0.5,
  osDev: 0.5,
}

const developer = {
  speed: 0.5,
  softwareDev: {multiplier: 0.65},
  gameDev: {multiplier: 0.65},
  social: 0.8,
  gameSkills: gameDevSkills,
  softwareSkills: softwareDevSkills
}

// Maps the multiplicators on the special skills
const skillSetMapping = {
  gameSkills: 'gameDev',
  softwareSkills: 'softwareDev',
}

module.exports = {
  developer: developer,
  skillSetMapping: skillSetMapping
}
