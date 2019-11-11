const settings = require('../../settings.json');
const { employeeSkills } = require('../helpers');

// Helper Functions
  const calcRandomMidOfVals = (valLow, valHigh) => {
    let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));
    return valRand + valLow;
  }

  const calcPenalty = (valLow, valHigh, contractType) => {
    let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));

    if(contractType === "basic"){
      valRand = valRand * 0.6;
    }else if(contractType === "timed"){
      valRand = valRand * 1.5;
    }
    
    return valRand + valLow;
  }

  const getRandomEntry = (client, table, done, closeConn = false) => {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM igct."${table}" ORDER BY RANDOM() limit 1`, (error, results) => {
          if (error) {
            closeConn && done();
            reject(error);
          } else {
            closeConn && done();
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
          } else {
            // Close connection if this is the last action
            closeConn && done();
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
      const data = getRandomEntry(client, 'Employee_data', done);

      // Add dynamic employee skill posibillitys
      const skills = employeeSkills(settings.SKILL_CONSTANT, 'developer');
      // Proceed with data processing when all promises have been resolved
      Promise.all([lastName, givenName, data, skills])
             .then(responses => {
              const employeeData = responses[2].rows[0];

               const resObj = {
                 givenName: responses[1].rows[0].givenName,
                 lastName: responses[0].rows[0].lastName,
                 employeeHistory: employeeData.history,
                 employeeType: employeeData.employeeType,
                 loc: calcRandomMidOfVals(employeeData.loc_lower, employeeData.loc_higher),
                 payment: calcRandomMidOfVals(employeeData.payment_lower, employeeData.payment_higher),
                 skills: responses[3],
                 workingDays: undefined,
                 working: false
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


module.exports = {
  calcRandomMidOfVals: calcRandomMidOfVals,
  getRandomEntry: getRandomEntry,
  getRandomEntryByCondition: getRandomEntryByCondition,
  getContract: getContract,
  getApplication: getApplication
}
