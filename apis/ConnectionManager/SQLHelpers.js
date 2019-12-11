const { SKILL_CONSTANT, TIMED_PENALTY, BASIC_PENALTY, APPLICATION_PROPABILITY } = require('../../settings.json');
const { employeeSkills } = require('./helpers');
const { writeLog } = require('./helpers');


// Helper Functions

//Save user to database
const checkUsername = (client, user, done, closeConn = false) => {
  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM igct."user" WHERE username='${user.username}'`, (error, results) => {
      if (error) {
        closeConn && done();
        writeLog("1", error);
        reject(error);
      } else {
        closeConn && done();
        writeLog("3", JSON.stringify(results));
        resolve(results);
      }
  })
})
}


const userLogin = (client, user, done, closeConn = false) => {

}

const userSignup = (client, user, done, closeConn = false) => {
  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO igct."user"(username, password) VALUES ('${user.username}', '${user.password}');`, (error, results) => {
        if(error) {
          closeConn && done();
          writeLog("1", error);
          reject(error);
        } else {
          closeConn && done();
          writeLog("3", JSON.stringify(results));
          resolve(results);
        }
      }
      )
  })
}

const calcRandomMidOfVals = (valLow, valHigh) => {
  let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));
  return valRand + valLow;
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

const getRandomEntry = (client, table, done, closeConn = false) => {
  return new Promise((resolve, reject) => {
      client.query(`SELECT * FROM igct."${table}" ORDER BY RANDOM() limit 1`, (error, results) => {
        if (error) {
          closeConn && done();
          writeLog("1", error);
          reject(error);
        } else {
          closeConn && done();
          writeLog("3", JSON.stringify(results));
          resolve(results);
        }
    })
  })
}

const getRandomEntryByCondition = (client, table, condition, done, closeConn = false) => {
  return new Promise((resolve, reject) => {
      client.query(`SELECT * FROM igct."${table}" WHERE ${condition} ORDER BY RANDOM() limit 1`, (error, results) => {
        if (error) {
          closeConn && done();
          reject(error);
          writeLog("1", error)
        } else {
          // Close connection if this is the last action
          closeConn && done();
          writeLog("3", JSON.stringify(results))
          resolve(results);
        }
    })
  })
}
// _______________________________________________________________________

const getContract = (client, query, done) => {
  return new Promise((resolve, reject) => {
    getRandomEntry(client, 'Contracts', done)
        .then(res => {
          let contract = res.rows[0];
          const resObj =  {
            name: contract.name,
            description: contract.desc,
            loc: calcRandomMidOfVals(contract.loc_lower, contract.loc_higher),
            revenue: calcRandomMidOfVals(contract.revenue_lower, contract.revenue_higher),
            penalty: calcPenalty(contract.revenue_lower, contract.revenue_higher, contract.contractType),
            contractType: contract.contractType,
            companyType: contract.companyType,
            team: undefined,
            pinned: false
          }
          done();
          resolve(resObj);
        })
        .catch(err => reject(err))
  });
}

// Get an random employee application
const getApplication = (client, query, done) => {
  return new Promise((resolve, reject ) => {
    const lastName = getRandomEntry(client, 'Employee_lastName', done);
    const givenName = getRandomEntry(client, 'Employee_givenName', done);
    let type = getRandomEmployeeType();
    const data = getRandomEntryByCondition(client, 'Employee_data', `employeetype='${type}'`, done);
    // Add dynamic employee skill posibillitys
    // Proceed with data processing when all promises have been resolved
    Promise.all([lastName, givenName, data])
            .then(responses => {
            const employeeData = responses[2].rows[0];
            const skills = employeeSkills(SKILL_CONSTANT, employeeData.employeetype);

              const resObj = {
                givenName: responses[1].rows[0].givenName,
                lastName: responses[0].rows[0].lastName,
                employeeHistory: employeeData.history,
                
                loc: calcRandomMidOfVals(employeeData.loc_lower, employeeData.loc_higher),
                payment: calcRandomMidOfVals(employeeData.payment_lower, employeeData.payment_higher),
                skills: skills,
                workingDays: undefined,
                working: false,
                employeetype: employeeData.employeetype
              }

              // Fech the picture based on the gender from the given name response
              getRandomEntryByCondition(client, 'Employee_picture', `gender=${responses[1].rows[0].gender}`, done)
                                      .then(picRes => {
                                        resObj.picture =  picRes.rows[0].picture;
                                        done();
                                        resolve(resObj);
                                      })
                                      .catch(err => {
                                        // If the picture fetching fails, send without picture url
                                        resObj.picture = null;
                                        done();
                                        resolve(resObj);
                                      });
            })
            .catch(err => reject(err));
  })
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

module.exports = {
  calcRandomMidOfVals: calcRandomMidOfVals,
  getRandomEntry: getRandomEntry,
  getRandomEntryByCondition: getRandomEntryByCondition,
  getContract: getContract,
  getApplication: getApplication,
  userSignup: userSignup,
  checkUsername: checkUsername
}
