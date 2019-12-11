const path = require('path')
const express = require('express');
const app = express()
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const ConnectionManager = require('./apis/ConnectionManager/ConnectionManager');
const { writeLog } = require('./apis/ConnectionManager/helpers');
const dir = path.join(__dirname, 'public/img');
const authHelpers = require('./apis/Authentication/authHelpers');



app.use('/images', express.static(dir));

app.use(bodyParser.json());

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const connectionManager = new ConnectionManager();

writeLog("3", "Connection esablished");

app.post('/login', (request, response) => {

  const user = {
    username: request.body.username,
    password: request.body.password,
  };

  connectionManager.runAction("userLogin", user)
              .then(res => {
                  writeLog("3", res);
                  response.send(res);
              }).catch(err => {
              writeLog("3", user.username + "_" + err);
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

  hash = authHelpers.saltHashPassword(request.body.password);

  const user = {
    username: request.body.username,
    password: hash.passwordHash,
    salt: hash.salt
};

  console.log(JSON.stringify(user));

  connectionManager.runAction("checkUsername", user)  
              .then(res => {
                if(res.rows[0]){
                  console.log(res.rows);
                  response.send("Username already taken!");
                }else{
                  connectionManager.runAction("userSignup", user)
                  .then(response.send("Registered!"))
                  .catch(err => {
                    console.log(err)
                    writeLog("1", err);
                    response.status(500).end()
                  })
                }
              })
});

//Get data
app.get('/getData', (request, response, next) => {
  let ip = (request.headers['x-forwarded-for'] || '').split(',').pop() || 
    request.connection.remoteAddress || 
    request.socket.remoteAddress || 
    request.connection.socket.remoteAddress

  writeLog("0", ip)

  connectionManager.runAction(request.query.operation, request.query)
              .then(res => response.send(res))
              .catch(err => {
                console.log(err)
                writeLog("1", err);
                response.status(500).end()
                });
})


app.listen(PORT);
