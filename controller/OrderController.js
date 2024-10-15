//const conn = require('../mariadb'); // DB 모듈
const mariadb = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');  // status code 모듈

const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'bookshop',
        dateStrings : true
    });   
    
    const {items, delivery, total_quantity, total_price, user_id, first_book_title} = req.body;

    // delivery 테이블 삽입
    let delivery_sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
    let delivery_values = [delivery.address, delivery.receiver, delivery.contact];
    let [delivery_results] = await conn.execute(delivery_sql, delivery_values);
    let delivery_id = delivery_results.insertId;

    // orders 테이블 삽입
    let orders_sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) 
            VALUES (?, ?, ?, ?, ?);`;
    let orders_values = [first_book_title, total_quantity, total_price, user_id, delivery_id]
    let [orders_results] = await conn.execute(orders_sql, orders_values);
    let order_id = orders_results.insertId;
    
    // items를 가지고 장바구니에서 book_id, quantity를 조회
    let cart_items_sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?);`;
    // let order_items = await conn.query(cart_items_sql, [items]);
    let [order_items, fields] = await conn.query(cart_items_sql, [items]);

    // orderedBook 테이블 삽입
    let ordered_book_sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?;`;
    // items는 배열로 받아오기 때문에 요소들을 하나씩 꺼냄
    let ordered_book_values = order_items.map(item => [order_id, item.book_id, item.quantity]);
    // 오류가 발생할 수 있으므로 query로 계속 진행
    let ordered_book_results = await conn.query(ordered_book_sql, [ordered_book_values]); 
    
    // 주문 완료 후 cartItem 삭제
    let result = await deleteCartItems(conn, items);

    return res.status(StatusCodes.OK).json(result);
};

const deleteCartItems = async (conn, items) => {
    // cartItemId 삭제  
    let del_cart_item_id_sql = `DELETE FROM cartItems WHERE id IN (?);`;    

    let del_cart_item_id_result = await conn.query(del_cart_item_id_sql, [items]);
    return del_cart_item_id_result;
};

const getOrders = async (req, res) => {
    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'bookshop',
        dateStrings : true
    });  

    let sql = `SELECT orders.id, book_title, total_quantity, total_price, created_at,
                address, receiver, contact
                FROM orders LEFT JOIN delivery
                ON orders.delivery_id = delivery.id;`;
    let [rows, fields] = await conn.query(sql);
    return res.status(StatusCodes.OK).json(rows);
};

const getOrderDetail =  async (req, res) => {
    const {id} = req.params;

    const conn = await mariadb.createConnection({
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'bookshop',
        dateStrings : true
    });   

    let sql = `SELECT book_id, title, author, price, quantity
                FROM orderedbook LEFT JOIN books
                ON orderedbook.book_id = books.id
                WHERE order_id = ?;`;
    let [rows, fields] = await conn.query(sql, id);
    return res.status(StatusCodes.OK).json(rows);
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
}