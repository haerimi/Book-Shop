const jwt = require('jsonwebtoken');
const conn = require('../mariadb'); // DB 모듈
const {StatusCodes} = require('http-status-codes');  // status code 모듈
const dotenv = require('dotenv').config();
const ensure_authorization = require('../auth');

// 장바구니 담기
const addToCart = (req, res) => {
    const {book_id, quantity} = req.body;

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
        let sql = 'INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?);';
        let values = [book_id, quantity, authorization.id];

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

// 장바구니 아이템 목록 조회 
const selectCart = (req, res) => {
    const {selected} = req.body;
    
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
        let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price 
        FROM cartItems LEFT JOIN books 
        ON cartItems.book_id = books.id
        WHERE user_id = ? AND cartItems.id IN (?);`;
        let values = [authorization.id, selected]
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

// 장바구니 도서 삭제
const removeCartItem = (req, res) => {
    const cart_item_id = req.params.id;
    let sql = 'DELETE FROM cartItems WHERE id = ?;';
    conn.query(sql, cart_item_id,
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
            }
        return res.status(StatusCodes.CREATED).json(results);  // Code => 200
    })
};

module.exports = {
    addToCart,
    selectCart,
    removeCartItem
};
