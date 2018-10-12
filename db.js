const { Client } = require('pg');
require('dotenv').config();

let client;

const connect = () => {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect((err) => {
    if (err) {
      console.log(err)
      client.end();
      setTimeout(() => connect(), 5000);
    } else {
      console.log('Succesfully applied database connection')
    }
  });
}

connect();



module.exports = client;
