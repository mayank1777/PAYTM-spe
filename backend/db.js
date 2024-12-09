const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async () => {
    try {
        const mongoURI = process.env.MONGO_URI; // Fetch MongoDB URI from .envconst mongoURI = mongodb+srv://admin:iQSZvFQqxVmMeO8o@cluster0.mongodb.net/paytm
        // const mongoURI = "mongodb+srv://admin:iQSZvFQqxVmMeO8o@cluster0.3bg9h.mongodb.net/paytm"
        console.log(mongoURI)
        if (!mongoURI) {
            throw new Error("MongoDB URI not found in environment variables");
        }

        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
    }
};
connectToDatabase();
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});
const User = mongoose.model('User' ,userSchema);
//creating a collection User

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});
const Account = mongoose.model('Account', accountSchema);
module.exports = {
    User,
    Account
}