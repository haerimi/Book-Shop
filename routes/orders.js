const express = require('express');
const router = express.Router();
const {order, getOrders, getOrderDetail} = require('../controller/OrderController');
router.use(express.json())


router.post('/', order);    // 결제하기 = 주문하기
router.get('/', getOrders); // 주문 목록 조회
router.get('/:id', getOrderDetail);    // 주문 상세 조회

// 모듈화
module.exports = router