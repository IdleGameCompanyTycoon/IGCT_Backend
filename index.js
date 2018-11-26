const express = require('express');
const app = express()
const PORT = process.env.PORT || 5000;
const ConnectionManager = require('./apis/ConnectionManager');

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const connectionManager = new ConnectionManager();

//Get random contract
app.get('/getData', (request, response, next) => {
  if(true) {
    connectionManager.runAction(request.query.operation, request.query)
                .then(res => response.send(res))
                .catch(err => response.send(err));
  } else {
    response.send('Operation could not be found');
  }
})


app.listen(PORT);
