const path = require('path')
const express = require('express');
const app = express()
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ConnectionManager = require('./apis/ConnectionManager/ConnectionManager');
const { writeLog } = require('./apis/ConnectionManager/helpers');
const User = require('./apis/Authentication/user');
const dir = path.join(__dirname, 'public/img');

app.use('/images', express.static(dir));

app.use(bodyParser.json());



app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const connectionManager = new ConnectionManager();
writeLog("3", "Connection esablished");
console.log(User);
app.post('/auth', (request, response) => {
  const user = new User({
    username: request.body.username,
    password: request.body.password
  }).save((err, response) => {
    if(err){
      res.status(400).send(err);
      res.status(200).send(response);
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
