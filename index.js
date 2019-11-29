const path = require('path')
const express = require('express');
const app = express()
const PORT = process.env.PORT || 5000;
const ConnectionManager = require('./apis/ConnectionManager/ConnectionManager');
const { writeLog } = require('./apis/ConnectionManager/helpers');

const dir = path.join(__dirname, 'public/img');

app.use('/images', express.static(dir));

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const connectionManager = new ConnectionManager();
writeLog("3", "Connection esablished");

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
