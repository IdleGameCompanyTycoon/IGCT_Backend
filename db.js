const { Client } = require('pg');
require('dotenv').config();

const connect = () => {
  return new Promise((resolve, reject) => {
    let client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });

    client.connect((err) => {
      if (err) {
        client.end();
        reject(err);
      } else {
        resolve(client)
      }
    });
  })
}




module.exports = connect;
