const hashHelpers = require('./hashHelpers');
const helpers = require('../Helpers/helpers');
const jwt = require('jsonwebtoken');

const generateToken = (username, TOKENKEY) => {
  return new Promise((resolve, reject) => {
    let token = jwt.sign({username: username},
      TOKENKEY,
      {expiresIn: '24h'}
      );
    resolve(token);
  });
}

const checkToken = (req, res, TOKENKEY) => {
  return new Promise((resolve, reject) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token.startsWith('Bearer ')){
      token = token.slice(7, token.length);
    }

    if(token){
      jwt.verify(token, TOKENKEY, (err, decoded) => {
        if(err){
          reject({
            success: false,
            message: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          resolve(req.decoded);
        }
      });
    } else {
      reject({
        success: false,
        message: 'Auth token is not supplied'
      });
    }
  });
};


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
    userLogin: userLogin,
    generateToken: generateToken,
    checkToken: checkToken
  }