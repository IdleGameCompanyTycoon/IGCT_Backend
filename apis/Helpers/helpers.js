const templates = require('../ConnectionManager/employeeTemplates')
const fs = require('fs');
const { TIMED_PENALTY, BASIC_PENALTY, APPLICATION_PROPABILITY, LOG_LEVEL } = require('../../settings.json');


const writeLog = (severity = "3", message) => {
  if(severity <= LOG_LEVEL){

    let severityTranslation = [];
    severityTranslation = ["IP", "ERROR", "WARNING", "INFO"];

    let time = getDateTime();
    let line = time + " - [" + severityTranslation[severity] + "] - " + message + "\n";
    let currentDate = new Date();
    let logname = currentDate.getDate() + "_" + (currentDate.getMonth()+1) + "_" + currentDate.getFullYear();
    fs.appendFile("./logs/" + logname + ".log", line, (err) => {
      if(err){
        return console.log(err);
      }
    })
  }
}

function getDateTime() {

  let date = new Date();

  let hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  let min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  let sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  let year = date.getFullYear();

  let month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  let day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + "-" + hour + ":" + min + ":" + sec;

}

const employeeSkills = (cap, employeeType) => {
  let template = templates[employeeType];
  let skills = {};
  if(template) {
    for (let field in template) {
      let val = template[field];
      if(typeof val === 'object' && !template[field].multiplier) {
        let multiplier = template[templates.skillSetMapping[field]].multiplier;
        let subObj = {};
        for (let subField in val) {
          subObj[subField] = Math.round(Math.random()*cap*val[subField]*multiplier*100)/100;
        }
        skills[field] = subObj;
      } else if (typeof val !== 'object') {
        skills[field] = Math.round(Math.random()*cap*val*100)/100;
      }
    }
  }
  return skills;
}

const getRandomEmployeeType = () => {
  const probArr = [];
  Object.keys(APPLICATION_PROPABILITY).forEach((key) => {
    let num = APPLICATION_PROPABILITY[key];
    while(num >= 1) {
        probArr.push(key);
        num--;
    }
  })
  type = probArr[Math.floor(Math.random()*probArr.length)];
  return type;
}

const calcPenalty = (valLow, valHigh, contractType) => {
  let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));

  if(contractType === "basic"){
    valRand = valRand * BASIC_PENALTY;
  }else if(contractType === "timed"){
    valRand = valRand * TIMED_PENALTY;
  }
  
  return valRand + valLow;
}

const calcRandomMidOfVals = (valLow, valHigh) => {
  let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));
  return valRand + valLow;
}

module.exports = {
  employeeSkills: employeeSkills,
  writeLog: writeLog,
  getRandomEmployeeType: getRandomEmployeeType,
  calcPenalty: calcPenalty,
  calcRandomMidOfVals: calcRandomMidOfVals,
}
