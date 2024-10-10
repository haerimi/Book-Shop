const express = require('express');
const router = express.Router();
const {addToCart, selectCart, removeCartItem} = require('../controller/CartController')

router.use(express.json())

router.post('/', addToCart);    // 장바구니 담기
router.get('/', selectCart);    // 장바구니 아아템 목록 조회 
                                // + 선택 된 id들이 req body로 같이 넘어 오도록 -> 선택된 장바구니 아이템 목록 조회
router.delete('/:id', removeCartItem);  // 장바구니 도서 삭제

// 모듈화
module.exports = router