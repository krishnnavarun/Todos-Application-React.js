const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                error: "No token provided" 
            });
        }

        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.slice(7) 
            : authHeader;

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ 
            error: "Invalid token" 
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ 
            error: "Admin access required" 
        });
    }
    next();
};

const isCustomer = (req, res, next) => {
    if (req.user.role !== "customer") {
        return res.status(403).json({ 
            error: "Customer access required" 
        });
    }
    next();
};

module.exports = { authenticateToken, isAdmin, isCustomer };