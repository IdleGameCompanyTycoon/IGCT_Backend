const { Client } = require('pg');
require('dotenv').config();

class ConnectionManager {
  constructor() {
    this.runAction = this.runAction.bind(this);
    this.success =  this.success.bind(this);
  }

  connect() {
    return new Promise((resolve, reject) => {
      let client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
      });

      client.connect((err) => {
        if (err) {
          client.end();
          reject(err);
        } else {
          resolve(client)
        }
      });
    })
  }

  runAction(action, query) {
    return new Promise((resolve, reject) => {
      this.connect().then(client => resolve(this.success(action, client, query)))
                    .catch(err => reject(this.error(err)))
    })
  }

  success(action, client, query) {
    if(this[action]) {
      return this[action](client, query)
    } else{
      client.end();
      return Promise.reject('operation not found')
    }
  }

  error(err) {
    console.log('connection was established', err);
    return Promise.reject('connection to database failed');
  }

  // Helper Functions
  calcRandomMidOfVals(valLow, valHigh) {
    let valRand = Math.floor(Math.random() * (valHigh - valLow + 1));
    return valRand + valLow;
  }

  getRandomEntry(client, table, closeConn = false) {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM igct."${table}" ORDER BY RANDOM() limit 1`, (error, results) => {
          if (error) {
            closeConn && client.end();
            reject(error);
          } else {
            closeConn && client.end();
            resolve(results);
          }
      })
    })
  }

  getRandomEntryByConidtion (client, table, condition, closeConn = false) {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM igct."${table}" WHERE ${condition} ORDER BY RANDOM() limit 1`, (error, results) => {
          if (error) {
            closeConn && client.end();
            reject(error);
          } else {
            // Close connection if this is the last action
            closeConn && client.end();
            resolve(results);
          }
      })
    })
  }
  // _______________________________________________________________________

  getContract(client, query) {
    return new Promise((resolve, reject) => {
      this.getRandomEntry(client, 'Contracts')
          .then(res => {
            let contract = res.rows[0];
            const resObj =  {
              name: contract.name,
              description: contract.desc,
              loc: this.calcRandomMidOfVals(contract.loc_lower, contract.loc_higher),
              revenue: this.calcRandomMidOfVals(contract.revenue_lower, contract.revenue_higher),
              contractType: contract.contractType,
              companyType: contract.companyType
            }
            client.end();
            resolve(resObj);
          })
          .catch(err => reject(err))
    });
  }

  // Get an random employee application
  getApplication(client, query) {
    return new Promise((reject, resolve) => {
      const lastName = this.getRandomEntry(client, 'Employee_lastName');
      const givenName = this.getRandomEntry(client, 'Employee_givenName');
      const data = this.getRandomEntry(client, 'Employee_data');
      // Proceed with data processing when all promises have been resolved
      Promise.all([lastName, givenName, data])
             .then(responses => {
              const employeeData = responses[2].rows[0];

               const resObj = {
                 givenName: responses[1].rows[0].givenName,
                 lastName: responses[0].rows[0].lastName,
                 employeeHiytory: employeeData.history,
                 loc: this.calcRandomMidOfVals(employeeData.loc_lower, employeeData.loc_higher),
                 payment: this.calcRandomMidOfVals(employeeData.payment_lower, employeeData.payment_higher)
               }

                // Fech the picture based on the gender from the given name response
               this.getRandomEntryByConidtion(client, 'Employee_picture', `gender=${responses[1].rows[0].gender}`)
                                        .then(picRes => {
                                          resObj.picture =  picRes.rows[0].picture;
                                          client.end();
                                          resolve(resObj);
                                        })
                                        .catch(err => {
                                          // If the picture fetching fails, send without picture url
                                          resObj.picture = null;
                                          client.end();
                                          resolve(resObj);
                                        });
             })
             .catch(err => reject(err));
    })
  }
}




module.exports = ConnectionManager;
