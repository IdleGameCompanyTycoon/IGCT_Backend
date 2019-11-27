const templates = require('./employeeTemplates')
const fs = require('fs');
const { LOG_LEVEL } = require('../../settings.json');


const writeLog = (severity = "3", message) => {
  if(severity <= LOG_LEVEL){

    let month = new Array();
    month[0] = "1";
    month[1] = "2";
    month[2] = "3";
    month[3] = "4";
    month[4] = "5";
    month[5] = "6";
    month[6] = "7";
    month[7] = "8";
    month[8] = "9";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";

    let severityTranslation = new Array();
    severityTranslation[0] = "";
    severityTranslation[1] = "ERROR";
    severityTranslation[2] = "WARNING";
    severityTranslation[3] = "INFO";

    let time = getDateTime();
    let line = time + " - [" + severityTranslation[severity] + "] - " + message + "\n";
    let currentDate = new Date();
    let logname = currentDate.getDate() + "_" + month[currentDate.getMonth()] + "_" + currentDate.getFullYear();
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

module.exports = {
  employeeSkills: employeeSkills,
  writeLog: writeLog
}
