const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

const generateToken = (user) => {
    if (!jwtSecret) {
        throw new Error("JWT secret is not configured");
    }

    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            role: user.role,
            name: user.name
        },
        jwtSecret,
        { expiresIn: "7d" }
    );
};

const registerUser = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: "Email, password, and name are required" 
            });
        }
        // Validate role if provided
        const validRoles = ["customer", "admin"];
        const userRole = role && validRoles.includes(role) ? role : "customer";

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
            role: userRole
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
                role: user.role,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ 
            error: "Registration failed: " + err.message
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
                role: user.role,
                profileImage: user.profileImage,
                createdAt: user.createdAt
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

const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profileImage } = req.body;

        if (!profileImage) {
            return res.status(400).json({
                error: "Profile image is required"
            });
        }

        if (typeof profileImage !== 'string') {
            return res.status(400).json({
                error: "Profile image must be a string (base64 or URL)"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile image updated successfully",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error("Update profile image error:", err.message);
        res.status(500).json({
            error: "Failed to update profile image: " + err.message
        });
    }
};

module.exports = { registerUser, loginUser, logoutUser, updateProfileImage };
