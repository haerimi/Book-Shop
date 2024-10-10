const express = require('express');
const router = express.Router();
const conn = require('../mariadb'); // DB 모듈
const {
    join,
    login,
    passwordReset,
    passwordResetRequest
} = require('../controller/UserController');
router.use(express.json());

// 회원가입
router.post('/join', join);
// 로그인
router.post('/login', login);
// 비밀번호 초기화 요청
router.post('/reset', passwordResetRequest);
// 비밀번호 초기화
router.put('/reset', passwordReset);

// 모듈화
module.exports = router