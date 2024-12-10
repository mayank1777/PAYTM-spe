const express = require('express');
const router = express.Router();
const { Account } = require('../db.js');
const { authMiddleware } = require('../middleware');
const mongoose = require('mongoose');
const winston = require('winston');
const Sentiment = require('sentiment');  // Import sentiment library

const sentiment = new Sentiment();  // Create a sentiment analyzer instance

// Set up Winston Logger
const logger = winston.createLogger({
  level: 'info', // Lowest level of logs to record
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/warn.log', level: 'warn' }),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// router.get("/balance", authMiddleware, async (req, res) => {
//   const account = await Account.findOne({
//     userId: req.userId
//   });
//   res.status(200).json({
//     balance: account.balance
//   });
// });

// Get Account Balance Route
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      logger.warn('Account not found for user', { userId: req.userId });
      return res.status(404).json({ message: 'Account not found' });
    }

    logger.info('Account balance retrieved successfully', { userId: req.userId, balance: account.balance });
    res.status(200).json({ balance: account.balance });
  } catch (error) {
    logger.error('Error retrieving account balance', { error: error.message });
    res.status(500).json({ message: 'Server Error' });
  }
});


// router.post("/transfer", authMiddleware, async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const { amount, to, note } = req.body;

//   // Fetch the accounts within the transaction
//   const account = await Account.findOne({ userId: req.userId }).session(session);

//   if (!account || account.balance < amount) {
//     await session.abortTransaction();
//     return res.status(400).json({
//       message: "Insufficient balance"
//     });
//   }

//   const toAccount = await Account.findOne({ userId: to }).session(session);

//   if (!toAccount) {
//     await session.abortTransaction();
//     return res.status(400).json({
//       message: "Invalid account"
//     });
//   }

//   // Perform the transfer
//   await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
//   await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

//   // Commit the transaction
//   await session.commitTransaction();

//   // Sentiment analysis
//   const sentimentResult = analyzeSentiment(note);

//   res.json({
//     message: "Transfer successful",
//     sentiment: sentimentResult.sentiment,
//     feedback: sentimentResult.feedback, // Send feedback to the frontend
//   });
// });

// Transfer Funds Route
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { amount, to } = req.body;

  try {
    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      logger.warn('Insufficient balance or account not found', { userId: req.userId, amount });
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      logger.warn('Invalid recipient account', { recipientUserId: to });
      return res.status(400).json({ message: "Invalid account" });
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    logger.info('Transfer successful', { fromUserId: req.userId, toUserId: to, amount });
    res.json({ message: "Transfer successful" });
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error during fund transfer', { error: error.message });
    res.status(500).json({ message: 'Server Error' });
  } finally {
    session.endSession();
  }
});

const feedbackMessages = {
  Positive: "Thank you for spreading positivity!",
  Negative: "Would you like to reconsider your message for a better experience?",
  Neutral: "Neutral messages are okay, but adding a personal touch could make it special!",
};


function analyzeSentiment(text) {
  const sentimentResult = sentiment.analyze(text);  // Get sentiment score

  if (sentimentResult.score > 0) {
    return { sentiment: "Positive", feedback: feedbackMessages["Positive"] };
  } else if (sentimentResult.score < 0) {
    return { sentiment: "Negative", feedback: feedbackMessages["Negative"] };
  } else {
    return { sentiment: "Neutral", feedback: feedbackMessages["Neutral"] };
  }
}

module.exports = router;
