const express = require('express');
const app = express()
const PORT = process.env.PORT || 5000;
const db = require('./db');

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Get random contract
app.get('/getData', function(request, response, next){
  db.query(`SELECT * FROM Employee_lastName ORDER BY RANDOM() limit 1`, function(error, results){
    if (error){
      response.status(400).send(error);
    } else {
      response.send(results);
    }
  })
})


app.listen(PORT);
