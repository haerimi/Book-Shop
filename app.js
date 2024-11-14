// express 모듈
const express = require('express');
const cors = require('cors');
const app = express();

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

// CORS 설정: 모든 도메인에서 오는 요청을 허용
app.use(cors()); // 기본적으로 모든 도메인에서 오는 요청을 허용

app.listen(process.env.PORT);

const userRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const categoryRouter = require('./routes/category');
const likeRouter = require('./routes/likes');
const cartRouter = require('./routes/carts');
const orderRouter = require('./routes/orders');

// 공통 URL 밖으로 내보내기
app.use('/users', userRouter);
app.use('/books', bookRouter);
app.use('/category', categoryRouter);
app.use('/likes', likeRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);
