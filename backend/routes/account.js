const express = require('express');
const router = express.Router();
const { Account } = require('../db.js');
const { authMiddleware } = require('../middleware');
const mongoose = require('mongoose');
const Sentiment = require('sentiment');  // Import sentiment library

const sentiment = new Sentiment();  // Create a sentiment analyzer instance

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId
  });
  res.status(200).json({
    balance: account.balance
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { amount, to, note } = req.body;
  
  // Fetch the accounts within the transaction
  const account = await Account.findOne({ userId: req.userId }).session(session);

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance"
    });
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);

  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account"
    });
  }

  // Perform the transfer
  await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
  await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

  // Commit the transaction
  await session.commitTransaction();

  // Sentiment analysis
  const sentimentResult = analyzeSentiment(note);

  res.json({
    message: "Transfer successful",
    sentiment: sentimentResult.sentiment,
    feedback: sentimentResult.feedback, // Send feedback to the frontend
  });
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
