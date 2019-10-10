const { Client, Pool } = require('pg');
const { employeeSkills } = require('../helpers');
const helper = require('./helpers')
require('dotenv').config();

class ConnectionManager {
  connect() {
    return new Promise((resolve, reject) => {
      if(!this.pool) {
         this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: true,
          idleTimeoutMillis: 60000
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
    if(helper[action]) {
      return helper[action](client, query, done)
    } else{
      done();
      return Promise.reject('operation not found')
    }
  }

  error(err) {
    console.log('connection was established', err);
    return Promise.reject('connection to database failed');
  }
}

module.exports = ConnectionManager;
