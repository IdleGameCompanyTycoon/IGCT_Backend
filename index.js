const path = require('path')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');

//Enviromental Variables
require('dotenv').config();
const TOKENKEY = process.env.TOKENKEY;
const PASSPHRASE = process.env.PASSPHRASE;
const PORT = process.env.PORT || 5000;

//Internal Dependencies
const ConnectionManager = require('./apis/ConnectionManager/ConnectionManager');
const helpers = require('./apis/Helpers/helpers');
const hashHelpers = require('./apis/Authentication/hashHelpers');
const authHelpers = require('./apis/Authentication/authHelpers');
const dir = path.join(__dirname, 'public/img');

//Options for HTTPS
const options = {
  key: fs.readFileSync('./ssl/cert_export_igct-backend.key'),
  cert: fs.readFileSync('./ssl/cert_export_igct-backend.crt'),
  passphrase: PASSPHRASE
};



app.use(helmet());
app.use('/images', express.static(dir));
app.use(bodyParser.json());
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const connectionManager = new ConnectionManager();

helpers.writeLog("3", "Connection esablished");

app.post('/setranking', (request, response) => {
  const usermoney = {
    username: request.body.username,
    money: request.body.money
  };
  connectionManager.runAction("setRanking", usermoney)
                .then(res => {
                  response.send(res);
                }).catch(err => {
                  response.send(err)
                });

})


app.get('/ranking', (request, response) => {
  authHelpers.checkToken(request, response, TOKENKEY)
            .then(decoded => {
              connectionManager.runAction(request.query.operation)
                .then(ranking => {
                  response.send(ranking.rows);
                }).catch(err => {
                  response.send(err);
                })
            }).catch(err => {
              helpers.writeLog("2", err);
              response.send(err);
            });
});


app.post('/login', (request, response) => {

  const user = {
    username: request.body.username,
    password: request.body.password,
  };

  connectionManager.runAction("userLogin", user)
              .then(res => {
                  helpers.writeLog("3", res);
                  authHelpers.generateToken(user.username, TOKENKEY)
                          .then(token => {
                            response.status(200).send(token);
                          }).catch(err => {
                            helpers.writeLog("2", err);
                            response.send(err);
                          });
              }).catch(err => {
                helpers.writeLog("3", user.username + "_" + err);
              response.status(500).send(err)
              });
})


app.post('/signup', (request, response) => {
  if(request.body.password.length < 6){
    response.send("Password too short.");
  };

  if(request.body.username.length < 3){
    response.send("Username too short.");
  };

  hash = hashHelpers.saltHashPassword(request.body.password);

  const user = {
    username: request.body.username,
    password: hash.passwordHash,
    salt: hash.salt
  };

  connectionManager.runAction("checkUsername", user)  
              .then(res => {
                if(res.rows[0]){
                  response.send("Username already taken!");
                }else{
                  connectionManager.runAction("userSignup", user)
                  .then(response.status(201).send("Registered!"))
                  .catch(err => {
                    console.log(err)
                    helpers.writeLog("1", err);
                    response.status(500).end()
                  })
                }
              })
});


app.get('/getData', (request, response, next) => {
  let ip = (request.headers['x-forwarded-for'] || '').split(',').pop() || 
    request.connection.remoteAddress || 
    request.socket.remoteAddress || 
    request.connection.socket.remoteAddress

    helpers.writeLog("0", ip)

  connectionManager.runAction(request.query.operation, request.query)
              .then(res => response.send(res))
              .catch(err => {
                console.log(err)
                helpers.writeLog("1", err);
                response.status(500).end()
                });
})


https.createServer(options, app).listen(PORT);
//app.listen(PORT);
