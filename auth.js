const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const ensure_authorization = (req, res) => {
    try {
        let received_jwt = req.headers['authorization'];

        let decoded_jwt = jwt.verify(received_jwt, process.env.PRIVATE_KEY);
        return decoded_jwt;
    } catch (err) {
        console.log(err.name);  //TokenExpiredError        
        console.log(err.message); //jwt expired

        return err;
    }
};

module.exports = ensure_authorization;