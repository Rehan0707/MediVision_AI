
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medivision');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define User Schema briefly to query
        const UserSchema = new mongoose.Schema({
            name: String,
            email: String,
            role: String
        });
        const User = mongoose.model('User', UserSchema);

        const users = await User.find({});
        console.log('Users found:', users.length);
        console.log(users);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
