const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
router.use('/auth', authRouter);

const verifyRouter = require('./verify');
router.use('/', verifyRouter);

const locationsRouter = require('./locations');
router.use('/', locationsRouter);

const reviewsRouter = require('./reviews');
router.use('/', reviewsRouter);

const suggestRouter = require('./suggest');
router.use('/', suggestRouter);

module.exports = router;