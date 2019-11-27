const templates = require('./employeeTemplates')
const fs = require('fs');


const writeLog = (severity, message) => {
  let time = getDateTime();
  let line = time + " - [" + severity + "] - " + message + "\n";
  let currentDate = new Date();
  let logname = currentDate.getDate() + "_" + currentDate.getMonth() + "_" + currentDate.getFullYear();
  console.log(logname);
  fs.appendFile("./logs/" + logname + ".log", line, (err) => {
    if(err){
      return console.log(err);
    }
  })
}

function getDateTime() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
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
