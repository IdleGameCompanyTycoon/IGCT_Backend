const db = require('../db');

// FIXME: Fetch from the contracts table instead of Employee_lastName
// TODO: Make the database query an function to be used as getRandom from table
const getContract = function() {
  db.query(`SELECT * FROM Employee_lastName ORDER BY RANDOM() limit 1`, function(error, results){
    if (error){
      response.status(400).send(error);
    } else {
      response.send(results);
    }
  })
}

module.exports =  {
  getContract: getContract
}
