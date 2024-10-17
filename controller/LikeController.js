const jwt = require('jsonwebtoken');
const conn = require('../mariadb'); // DB 모듈
const {StatusCodes} = require('http-status-codes');  // status code 모듈
const ensure_authorization = require('../auth');

// 좋아요 추가
const addLike = (req, res) => {
    const book_id = req.params.id;
    
    let authorization = ensure_authorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message' : '로그인 세션이 만료되었습니다. 다시 로그인 하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) { 
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message' : '잘못된 토큰입니다.'
        });
    } else {
        let sql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)';
        let values = [authorization.id, book_id];
        conn.query(sql, values,
            (err, results) => {
                if (err) {
                    console.log(err)
                    return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
                }
            return res.status(StatusCodes.CREATED).json(results);  // Code => 200
        });
    };
};

// 좋아요 취소
const removeLike = (req, res) => {
    const book_id = req.params.id;

    let authorization = ensure_authorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message' : '로그인 세션이 만료되었습니다. 다시 로그인 하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) { 
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message' : '잘못된 토큰입니다.'
        });
    } else {
        let sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
        let values = [authorization.id, book_id];

        conn.query(sql, values,
            (err, results) => {
                if (err) {
                    console.log(err)
                    return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
                }
            return res.status(StatusCodes.CREATED).json(results);  // Code => 200
        });
    };  
};

module.exports = {
    addLike,
    removeLike
};
