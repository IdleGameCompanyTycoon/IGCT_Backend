const db = require('../db');

// Helper functions
//______________________________________________________________________________

const calcRandomMidOfVals =  (valLow, valHigh) => {
  let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));
  return valRand + valLow;
}

// Fetch a random entry from given table
const getRandomEntry = function(table) {
  return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM igct."${table}" ORDER BY RANDOM() limit 1`, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
    })
  })
}

// Fetch a random entry from given table and with given condition
const getRandomEntryByConidtion = function(table, condition) {
  return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM igct."${table}" WHERE ${condition} ORDER BY RANDOM() limit 1`, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
    })
  })
}

//______________________________________________________________________________

// FIXME: Fetch from the contracts table instead of Employee_lastName
const getContract = (query) => {
  return getRandomEntry('Employee_lastName');
}

// Get an random employee application
const getApplication = (query) => {
  return new Promise((reject, resolve) => {
    const lastName = getRandomEntry('Employee_lastName');
    const givenName = getRandomEntry('Employee_givenName');
    const data = getRandomEntry('Employee_data');
    // Proceed with data processing when all promises have been resolved
    Promise.all([lastName, givenName, data])
           .then(responses => {
              // Fech the picture based on the gender from the given name response
             getRandomEntryByConidtion('Employee_picture', `gender=${responses[1].rows[0].gender}`)
                                      .then(picRes => {
                                        const resObj = {
                                          givenName: responses[1].rows[0].givenName,
                                          lastName: responses[0].rows[0].lastName,
                                          picture: picRes.rows[0].picture,
                                          employeeData: responses[2].rows[0]
                                        }
                                        resolve(resObj);
                                      })
                                      .catch(err => {
                                        // If the picture fetching fails, send without picture url
                                        const resObj = {
                                          givenName: responses[1].rows[0].givenName,
                                          lastName: responses[0].rows[0].lastName,
                                          picture: null,
                                          employeeData: responses[2].rows[0]
                                        }

                                        resolve(resObj);
                                      });
           })
           .catch(err => reject(err));
  })
}

module.exports =  {
  getContract: getContract,
  getApplication: getApplication
}
