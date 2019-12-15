const hashHelpers = require('./hashHelpers');
const helpers = require('../Helpers/helpers');
//Save user to database
const checkUsername = (client, user, done, closeConn = false) => {
    return new Promise((resolve, reject) => {
      client.query(`SELECT * FROM igct."user" WHERE username='${user.username}'`, (error, results) => {
        if (error) {
          closeConn && done();
          helpers.writeLog("1", error);
          reject(error);
        } else {
          closeConn && done();
          resolve(results);
        }
    })
  })
  }
  
  
  const userLogin = (client, user, done, closeConn = false) => {
    return new Promise((resolve, reject) => {
      checkUsername(client, user).then(res => {
        let enteredHash = hashHelpers.saltHashPassword(user.password, res.rows[0].salt)
        if(enteredHash.passwordHash == res.rows[0].password){
          closeConn && done();
          resolve("Successfully authenticated!");
        } else {
          closeConn && done();
          reject("Wrong credentials!");
        }
      })
    })
  }
  
  const userSignup = (client, user, done, closeConn = false) => {
    return new Promise((resolve, reject) => {
      client.query(
        `INSERT INTO igct."user"(username, password, salt) VALUES ('${user.username}', '${user.password}', '${user.salt}');`, (error, results) => {
          if(error) {
            closeConn && done();
            helpers.writeLog("1", error);
            reject(error);
          } else {
            closeConn && done();
            helpers.writeLog("3", JSON.stringify(results));
            resolve(results);
          }
        }
        )
    })
  }

  module.exports = {
    userSignup: userSignup,
    checkUsername: checkUsername,
    userLogin: userLogin
  }