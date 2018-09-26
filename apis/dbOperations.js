const db = require('../db');

const getRandomEntry =  function(table) {
  return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM ${table} ORDER BY RANDOM() limit 1`, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
    })
  })
}

// FIXME: Fetch from the contracts table instead of Employee_lastName
// TODO: Make the database query an function to be used as getRandom from table
const getContract = function(query) {
  return getRandomEntry(query.table);
}

module.exports =  {
  getContract: getContract
}
