const templates = require('./employeeTemplates')

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
  employeeSkills: employeeSkills
}
