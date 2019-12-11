const crypto = require('crypto');

const genRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
}

const sha512 = (password, salt) => {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

const saltHashPassword = (userpassword) => {
    let salt = genRandomString(16);
    let passwordData = sha512(userpassword, salt);
    return passwordData.passwordHash;
    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);
}

module.exports = {
    saltHashPassword: saltHashPassword,
  }
  