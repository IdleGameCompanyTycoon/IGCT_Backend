const connect = require('../db');

// Establis connection and reconnect until connection is establised
let db;
const establishConnection = () => {
  connect().then(res => {
    db = res;
    console.log('Connected to Database')
  })
  .catch(err => {
    console.log(err);
    establishConnection();
  })
}

establishConnection();

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
const getRandomEntryByCondition = function(table, condition) {
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
            const employeeData = responses[2].rows[0];

             const resObj = {
               givenName: responses[1].rows[0].givenName,
               lastName: responses[0].rows[0].lastName,
               employeeHiytory: employeeData.history,
               loc: calcRandomMidOfVals(employeeData.loc_lower, employeeData.loc_higher),
               payment: calcRandomMidOfVals(employeeData.payment_lower, employeeData.payment_higher)
             }

              // Fech the picture based on the gender from the given name response
             getRandomEntryByCondition('Employee_picture', `gender=${responses[1].rows[0].gender}`)
                                      .then(picRes => {
                                        resObj.picture =  picRes.rows[0].picture;
                                        resolve(resObj);
                                      })
                                      .catch(err => {
                                        // If the picture fetching fails, send without picture url
                                        resObj.picture =  null;
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
