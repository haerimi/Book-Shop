const express = require('express');
const router = express.Router();

router.use(express.json())

// 회원가입
router.post('/users/join', (req, res) => {
    res.json('회원가입');
});
// 로그인
router.post('/users/login', (req, res) => {
    res.json('로그인');
});
// 비밀번호 초기화 요청
router.post('/users/reset', (req, res) => {
    res.json('비밀번호 초기화 요청');
});
// 비밀번호 초기화
router.put('/users/reset', (req, res) => {
    res.json('비밀번호 초기화');
});

// 모듈화
module.exports = router