const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            role: user.role,
            name: user.name
        },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
    );
};

const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: "Email, password, and name are required" 
            });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(409).json({ 
                error: "Email already exists" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role: "customer"
        });

        const user = await newUser.save();
        const token = generateToken(user);

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ 
            error: "Registration failed" 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email and password are required" 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                error: "Invalid email or password" 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: "Invalid email or password" 
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ 
            error: "Login failed" 
        });
    }
};

const logoutUser = (req, res) => {
    return res.status(200).json({ 
        message: "Logout successful" 
    });
};

module.exports = { registerUser, loginUser, logoutUser };
