const { Client, Pool } = require('pg');
const { writeLog } = require('../Helpers/helpers');
require('dotenv').config();
const CMHelpers = require('./CMHelpers');

class ConnectionManager {
  connect() {
    return new Promise((resolve, reject) => {
      if(!this.pool) {
         this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: true,
          idleTimeoutMillis: 60000
        });
        this.pool.on('error', (err, client) => {
          writeLog("1", "Connection to database unexpectedly lost!")
          console.log("Connection to database unexpectedly lost!")
        });
      }

      this.pool.connect((err, client, done) => {
        if (err) {
          done();
          writeLog("1", err)
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
    if(CMHelpers[action]) {
      return CMHelpers[action](client, query, done)
    } else{
      done();
      return Promise.reject("Operation not found: " + action)
    }
  }

  error(err) {
    console.log('connection was established', err);
    return Promise.reject('connection to database failed');
  }
}

module.exports = ConnectionManager;
