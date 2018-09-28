const db = require('../db');

const getRandomEntry =  function(table) {
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

// FIXME: Fetch from the contracts table instead of Employee_lastName
const getContract = (query) => {
  return getRandomEntry('Employee_lastName');
}

const getApplication = (query) => {
  return new Promise((reject, resolve) => {
    const lastName = getRandomEntry('Employee_lastName');
    const firstName = getRandomEntry('Employee_lastFirst');
    Promise.all([lastName, firstName])
           .then(responses => {
             const picture = '';
             const data =  '';
             const resObj = {
               firstName: responses[1],
               lastName: responses[0],
               picture: picture,
               employeeData: data
             }

             resolve(resObj);
           })
  })
}

module.exports =  {
  getContract: getContract,
  getApplication: getApplication
}
