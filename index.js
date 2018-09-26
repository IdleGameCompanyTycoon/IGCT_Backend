const express = require('express');
const app = express()
const PORT = process.env.PORT || 5000;
const dbOperations = require('./apis/dbOperations');

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Get random contract
app.get('/getData', function(request, response, next){
  dbOperations['getContract']();
})


app.listen(PORT);
