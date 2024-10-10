const express = require('express');
const router = express.Router();
const {
    allBooks,
    bookDetail
} = require('../controller/BookController');

router.use(express.json())

router.get('/', allBooks);  // 전체 도서 조회 & 카테고리 별 도서 조회
router.get('/:id', bookDetail); // 개별 도서 조회

// 모듈화
module.exports = router