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

const softwareDevSkills = {
  network: 0.5,
  uiDev: 0.5,
  server: 0.5,
  osDev: 0.5,
}

const teamBuffSkills = {
  mgmt: 0.3,
  speed: 0.1,
}

// Templates
const developer = {
  speed: 0.5,
  softwareDev: {multiplier: 0.65},
  gameDev: {multiplier: 0.65},
  social: 0.6,
  gameSkills: gameDevSkills,
  softwareSkills: softwareDevSkills,
}

const projectManager = {
  speed: 0.3,
  softwareDev: {multiplier: 0.3},
  gameDev: {multiplier: 0.3},
  teamBuff: {multiplier: 0.65},
  social: 0.8,
  gameSkills: gameDevSkills,
  softwareSkills: softwareDevSkills,
  teamSkills: teamBuffSkills,
}

// Maps the multiplicators on the special skills
const skillSetMapping = {
  gameSkills: 'gameDev',
  softwareSkills: 'softwareDev',
  teamSkills: 'teamBuff',
}

module.exports = {
  projectManager: projectManager,
  developer: developer,
  skillSetMapping: skillSetMapping,
}
