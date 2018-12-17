const { Client, Pool } = require('pg');
require('dotenv').config();

class ConnectionManager {
  connect() {
    return new Promise((resolve, reject) => {
      if(!this.pool) {
         this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: true,
          idleTimeoutMillis: 300000
        });
      }

      this.pool.connect((err, client, done) => {
        if (err) {
          done();
          reject(err);
        } else {
          resolve({client: client, close: done})
        }
      });
    })
  }

  runAction(action, query) {
    return new Promise((resolve, reject) => {
      this.connect().then(obj => resolve(this.success(action, obj.client, query, obj.close)))
                    .catch(err => reject(this.error(err)))
    })
  }

  success(action, client, query, done) {
    if(this[action]) {
      return this[action](client, query, done)
    } else{
      done();
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

  getRandomEntry(client, table, done, closeConn = false) {
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

  getRandomEntryByConidtion (client, table, condition, done, closeConn = false) {
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

  getContract(client, query, done) {
    return new Promise((resolve, reject) => {
      this.getRandomEntry(client, 'Contracts', done)
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
            done();
            resolve(resObj);
          })
          .catch(err => reject(err))
    });
  }

  // Get an random employee application
  getApplication(client, query, done) {
    return new Promise((reject, resolve) => {
      const lastName = this.getRandomEntry(client, 'Employee_lastName', done);
      const givenName = this.getRandomEntry(client, 'Employee_givenName', done);
      const data = this.getRandomEntry(client, 'Employee_data', done);
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
               this.getRandomEntryByConidtion(client, 'Employee_picture', `gender=${responses[1].rows[0].gender}`, done)
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
}




module.exports = ConnectionManager;
