const conn = require('../mariadb'); // DB 모듈
const {StatusCodes} = require('http-status-codes');  // status code 모듈

const allCategory = (req, res) => {
    let sql = 'SELECT * FROM category';

    conn.query(sql, 
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
            }
        return res.status(StatusCodes.CREATED).json(results);  // Code => 200
    })
};

module.exports = allCategory;
