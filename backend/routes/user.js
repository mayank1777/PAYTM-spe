const express = require('express');
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const { User, Account } = require("../db.js");
const { authMiddleware } = require("../middleware.js");
const winston = require('winston');

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

// // Signup Route
// router.post("/signup", async (req, res) => {
//     const result = signupBody.safeParse(req.body);
//     if (!result.success) {
//         const errors = result.error.errors.map(err => err.message);
//         return res.status(400).json({
//             message: "Validation error",
//             errors: errors // Include detailed validation errors
//         });
//     }
//     const existingUser = await User.findOne({
//         username: req.body.username
//     });
//     if (existingUser) {
//         return res.status(409).json({ // 409 Conflict for duplicate resource
//             message: "Email already taken"
//         });
//     }

//     const user = await User.create(req.body);
//     const userId = user._id;
//     await Account.create({
//         userId,
//         balance: 1 + Math.random() * 10000
//     })
//     const token = jwt.sign({ userId }, JWT_SECRET);

//     return res.status(201).json({ // 201 Created
//         message: "User created successfully",
//         token
//     });
// });

// Signup Route
router.post("/signup", async (req, res) => {
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        logger.warn('Signup validation failed', { errors });
        return res.status(400).json({
            message: "Validation error",
            errors: errors
        });
    }

    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        logger.warn('Signup attempt with existing email', { email: req.body.username });
        return res.status(409).json({
            message: "Email already taken"
        });
    }

    try {
        const user = await User.create(req.body);
        const userId = user._id;
        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        });

        const token = jwt.sign({ userId }, JWT_SECRET);

        logger.info('New user signed up', { email: req.body.username });

        return res.status(201).json({ // 201 Created
            message: "User created successfully",
            token
        });
    } catch (error) {
        logger.error('Error during user signup', { error: error.message });
        return res.status(500).json({
            message: "Server Error"
        });
    }
});



// // Signin Route
// router.post("/signin", async (req, res) => {
//     const result = signinBody.safeParse(req.body);
//     console.log("what is happening")
//     if (!result.success) {
//         const errors = result.error.errors.map(err => err.message);
//         return res.status(400).json({
//             message: "Validation error",
//             errors: errors // Include detailed validation errors
//         });
//     }

//     const existingUser = await User.findOne({
//         username: req.body.username,
//         password: req.body.password
//     });
//     if (!existingUser) {
//         return res.status(401).json({ // 401 Unauthorized for invalid credentials
//             message: "Invalid email or password"
//         });
//     }

//     const userId = existingUser._id;
//     const token = jwt.sign({ userId }, JWT_SECRET);

//     return res.status(200).json({
//         message: "Signin successful",
//         token
//     });
// });

// Signin Route
router.post("/signin", async (req, res) => {
    const result = signinBody.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        logger.warn('Signin validation failed', { errors });
        return res.status(400).json({
            message: "Validation error",
            errors: errors // Include detailed validation errors
        });
    }

    try {
        const existingUser = await User.findOne({
            username: req.body.username,
            password: req.body.password
        });
        if (!existingUser) {
            logger.warn('Signin attempt failed for non-existing user', { email: req.body.username });
            return res.status(401).json({ // 401 Unauthorized for invalid credentials
                message: "Invalid email or password"
            });
        }

        const userId = existingUser._id;
        const token = jwt.sign({ userId }, JWT_SECRET);

        logger.info('User signed in successfully', { email: req.body.username });

        return res.status(200).json({
            message: "Signin successful",
            token
        });
    } catch (error) {
        logger.error('Error during signin', { error: error.message });
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

// // Update User Route
// router.put("/", authMiddleware, async (req, res) => {
//     const result = updateBody.safeParse(req.body);
//     if (!result.success) {
//         const errors = result.error.errors.map(err => err.message);
//         return res.status(400).json({
//             message: "Validation error",
//             errors: errors // Include detailed validation errors
//         });
//     }

//     const updated = await User.updateOne(
//         { _id: req.userId },
//         req.body
//     );

//     if (updated.modifiedCount === 0) {
//         return res.status(404).json({ // 404 Not Found if no document was updated
//             message: "User not found or no changes made"
//         });
//     }

//     return res.status(200).json({
//         message: "Updated successfully"
//     });
// });
// router.get("/bulk", async (req, res) => {
//     const filter = req.query.filter || "";
//     const users = await User.find({
//         $or: [
//             {
//                 firstName: {
//                     $regex: filter, // Correct usage of $regex
//                     $options: "i", // Case-insensitive match
//                 },
//             },
//             {
//                 lastName: {
//                     $regex: filter, // Correct usage of $regex
//                     $options: "i", // Case-insensitive match
//                 },
//             },
//         ],
//     });
//     res.json({
//         user: users.map((user) => ({
//             username: user.username,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             _id: user._id,
//         })),
//     });
// });

// Update User Route
router.put("/", authMiddleware, async (req, res) => {
    const result = updateBody.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => err.message);
        logger.warn('Update validation failed', { errors });
        return res.status(400).json({
            message: "Validation error",
            errors: errors
        });
    }

    try {
        const updated = await User.updateOne(
            { _id: req.userId },
            req.body
        );

        if (updated.modifiedCount === 0) {
            logger.warn('No changes made during user update', { userId: req.userId });
            return res.status(404).json({ // 404 Not Found if no document was updated
                message: "User not found or no changes made"
            });
        }

        logger.info('User updated successfully', { userId: req.userId });

        return res.status(200).json({
            message: "Updated successfully"
        });
    } catch (error) {
        logger.error('Error during user update', { error: error.message });
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

// router.get("/getUser", authMiddleware, async (req, res) => {
//     const user = await User.findOne({
//         _id: req.userId,
//     });
//     res.json(user);
// });

// Get Single User Route
router.get("/getUser", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.userId,
        });

        if (!user) {
            logger.warn('User not found', { userId: req.userId });
            return res.status(404).json({
                message: "User not found"
            });
        }

        logger.info('User retrieved successfully', { userId: req.userId });
        res.json(user);
    } catch (error) {
        logger.error('Error during user retrieval', { error: error.message });
        res.status(500).json({
            message: 'Server Error'
        });
    }
});


// module.exports = router;

module.exports = router;
