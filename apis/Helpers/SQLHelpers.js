const { SKILL_CONSTANT } = require('../../settings.json');
const helpers = require('./helpers');


// SQLHelper Functions

const getAllEntrys = (client, table, select, orderby, done, closeConn = false) => {
  return new Promise((resolve, reject) => {
    client.query(`SELECT ${select} FROM igct."${table}" ORDER BY ${orderby} DESC`, (error, results) => {
      if (error) {
        closeConn && done();
        helpers.writeLog("1", error);
        reject(error);
      } else {
        closeConn && done();
        helpers.writeLog("3", JSON.stringify(results));
        resolve(results);
      }
    })
  })
}

const getRandomEntry = (client, table, done, closeConn = false) => {
  return new Promise((resolve, reject) => {
      client.query(`SELECT * FROM igct."${table}" ORDER BY RANDOM() limit 1`, (error, results) => {
        if (error) {
          closeConn && done();
          helpers.writeLog("1", error);
          reject(error);
        } else {
          closeConn && done();
          helpers.writeLog("3", JSON.stringify(results));
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
          helpers.writeLog("1", error)
        } else {
          // Close connection if this is the last action
          closeConn && done();
          helpers.writeLog("3", JSON.stringify(results))
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
            loc: helpers.calcRandomMidOfVals(contract.loc_lower, contract.loc_higher),
            revenue: helpers.calcRandomMidOfVals(contract.revenue_lower, contract.revenue_higher),
            penalty: helpers.calcPenalty(contract.revenue_lower, contract.revenue_higher, contract.contractType),
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
    let type = helpers.getRandomEmployeeType();
    const data = getRandomEntryByCondition(client, 'Employee_data', `employeetype='${type}'`, done);
    // Add dynamic employee skill posibillitys
    // Proceed with data processing when all promises have been resolved
    Promise.all([lastName, givenName, data])
            .then(responses => {
            const employeeData = responses[2].rows[0];
            const skills = helpers.employeeSkills(SKILL_CONSTANT, employeeData.employeetype);

              const resObj = {
                givenName: responses[1].rows[0].givenName,
                lastName: responses[0].rows[0].lastName,
                employeeHistory: employeeData.history,
                
                loc: helpers.calcRandomMidOfVals(employeeData.loc_lower, employeeData.loc_higher),
                payment: helpers.calcRandomMidOfVals(employeeData.payment_lower, employeeData.payment_higher),
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


const getRanking = (client, query, done) => {
  return new Promise((resolve, reject) => {
    getAllEntrys(client, 'user', "username, money", '1', done)
      .then(results => {
        resolve(results);
        done();
      }).catch(err => {
        done();
        reject(err);
      })
  });
}

const setRanking = (client, query, done, closeConn = false) => {
  return new Promise((resolve,reject) => {
    client.query(
      `UPDATE igct."user" SET money='${query.money}' WHERE username='${query.username}';`, (error, results) => {
        if(error) {
          closeConn && done();
          helpers.writeLog("1", error);
          reject(error);
        } else {
          closeConn && done();
          helpers.writeLog("3", JSON.stringify(results));
          resolve(results);
        }
      }
      )
  })
}


module.exports = {
  //calcRandomMidOfVals: calcRandomMidOfVals,
  getRandomEntry: getRandomEntry,
  getRandomEntryByCondition: getRandomEntryByCondition,
  getContract: getContract,
  getApplication: getApplication,
  getAllEntrys: getAllEntrys,
  getRanking: getRanking,
  setRanking: setRanking
}
