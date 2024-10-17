const conn = require('../mariadb'); // DB 모듈
const {StatusCodes} = require('http-status-codes');  // status code 모듈
const jwt = require('jsonwebtoken');
const ensure_authorization = require('../auth');

// 전체 도서 조회 => 도서의 상세 정보 포함
// 필요한 데이터만 선별하여 구현 할 것
const allBooks = (req, res) => {
    let all_books_res = {};
    let {category_id, new_book, limit, current_page} = req.query;

     // 기본값 설정
    limit = parseInt(limit);
    current_page = parseInt(current_page);
    let offset = limit * (current_page - 1);

    let sql = 'SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes FROM books';
    let values = [];

    // 카테고리 id와 new_book이 있는 경우
    if (category_id && new_book) {
        sql += ' WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
        values = [category_id];
    }
    // 카테고리 id만 있는 경우
    else if (category_id) {
        sql += ' WHERE category_id = ?';    
        values = [category_id];
    }
    // 둘다 없는 경우
    else if (new_book) {
        sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    }
    
    sql += ' LIMIT ? OFFSET ?';
    values.push(limit, offset);

    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
            }
            if (results.length) {
                // results.map(function(result) {
                //     result.pubDate = results.pub_date;
                //     delete result.pub_date;
                // });
                all_books_res.books = results;
            }
            else return res.status(StatusCodes.NOT_FOUND).end();
    })

    sql = ' SELECT found_rows();';
    conn.query(sql,
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
            }
            let pagination = {};
            pagination.current_page = parseInt(current_page);
            pagination.total_count = results[0]['found_rows()'];

            all_books_res.pagination = pagination;

            return res.status(StatusCodes.OK).json(all_books_res);  // Code => 200
        
    })
};

// 개별 도서 조회
const bookDetail = (req, res) => {

    // 로그인 상태 => liked 추가해서 보내주기
    // 비로그인 상태 => liked 제외하고 보내주기
    let authorization = ensure_authorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message' : '로그인 세션이 만료되었습니다. 다시 로그인 하세요.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) { 
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message' : '잘못된 토큰입니다.'
        });
    } else if (authorization instanceof ReferenceError) { 
        let book_id = req.params.id;    // let {id} = req.params

        //SELECT * FROM books WHERE id = ?
        let sql = `SELECT *
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id 
                WHERE books.id=?;`;

        let values = [book_id];
        conn.query(sql, values,
            (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
            }
            if (results[0]) 
                return res.status(StatusCodes.OK).json(results[0]);  // Code => 200
            else 
                return res.status(StatusCodes.NOT_FOUND).end();
        })
        
    } else {
        let book_id = req.params.id;    // let {id} = req.params
        
        //SELECT * FROM books WHERE id = ?
        let sql = `SELECT *, 
                    (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes,
                    (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id 
                WHERE books.id=?;`;

        let values = [authorization.id, book_id, book_id];
        conn.query(sql, values,
            (err, results) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end(); // BAD REQUEST == 400
            }
            if (results[0]) 
                return res.status(StatusCodes.OK).json(results[0]);  // Code => 200
            else 
                return res.status(StatusCodes.NOT_FOUND).end();
        })
    }
}; 


module.exports = {
    allBooks,
    bookDetail
}