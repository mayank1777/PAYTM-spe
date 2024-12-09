const express = require('express');
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const { User  , Account} = require("../db.js");
const { authMiddleware } = require("../middleware.js");

// Validation Schemas
const signupBody = zod.object({
    username: zod.string().email("Invalid email address"),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string().min(6, "Password too short. Minimum length is 6 characters")
});

const signinBody = zod.object({
    username: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password too short. Minimum length is 6 characters")
});

const updateBody = zod.object({
    password: zod.string().min(6, "Password too short. Minimum length is 6 characters").optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

// Routes

// Signup Route
router.post("/signup", async (req, res) => {
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        return res.status(400).json({
            message: "Validation error",
            errors: errors // Include detailed validation errors
        });
    }
    const existingUser = await User.findOne({
        username: req.body.username
    });
    if (existingUser) {
        return res.status(409).json({ // 409 Conflict for duplicate resource
            message: "Email already taken"
        });
    }

    const user = await User.create(req.body);
    const userId = user._id;
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })
    const token = jwt.sign({ userId }, JWT_SECRET);

    return res.status(201).json({ // 201 Created
        message: "User created successfully",
        token
    });
});

// Signin Route
router.post("/signin", async (req, res) => {
    const result = signinBody.safeParse(req.body);
    console.log("what is happening")
    if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        return res.status(400).json({
            message: "Validation error",
            errors: errors // Include detailed validation errors
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });
    if (!existingUser) {
        return res.status(401).json({ // 401 Unauthorized for invalid credentials
            message: "Invalid email or password"
        });
    }

    const userId = existingUser._id;
    const token = jwt.sign({ userId }, JWT_SECRET);

    return res.status(200).json({
        message: "Signin successful",
        token
    });
});

// Update User Route
router.put("/", authMiddleware, async (req, res) => {
    const result = updateBody.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        return res.status(400).json({
            message: "Validation error",
            errors: errors // Include detailed validation errors
        });
    }

    const updated = await User.updateOne(
        { _id: req.userId },
        req.body
    );

    if (updated.modifiedCount === 0) {
        return res.status(404).json({ // 404 Not Found if no document was updated
            message: "User not found or no changes made"
        });
    }

    return res.status(200).json({
        message: "Updated successfully"
    });
});
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [
            {
                firstName: {
                    $regex: filter, // Correct usage of $regex
                    $options: "i", // Case-insensitive match
                },
            },
            {
                lastName: {
                    $regex: filter, // Correct usage of $regex
                    $options: "i", // Case-insensitive match
                },
            },
        ],
    });
    res.json({
        user: users.map((user) => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        })),
    });
});
router.get("/getUser", authMiddleware, async (req, res) => {
    const user = await User.findOne({
      _id: req.userId,
    });
    res.json(user);
  });
  
  module.exports = router;

module.exports = router;
