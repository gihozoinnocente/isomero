/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (minimum 6 characters)
 *           example: yourpassword123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjYyMzA1ZjM3ZjY2YjY2NjY2NjY2NjY2NjYiLCJpYXQiOjE2OTI4MzUyMzUsImV4cCI6MTY5MjkyMTYzNX0.xL9bX7G3bX7G3bX7G3bX7G3bX7G3bX7G3
 *         user:
 *           $ref: '#/components/schemas/User'
 *     TokenResponse:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *           example: true
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: 6662305f37f66b6666666666
 *             email:
 *               type: string
 *               example: user@example.com
 *             name:
 *               type: string
 *               example: John Doe
 */

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendError } = require('../utils/errorHandler');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             email: user@example.com
 *             password: yourpassword123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for email:', email);
        
        // Validate input
        if (!email || !password) {
            return sendError(res, 'Email and password are required', [], 400);
        }
        
        // Get user with password hash
        const user = await User.findByEmail(email);
        
        if (!user) {
            console.log('User not found for email:', email);
            return sendError(res, 'Invalid credentials', ['User not found'], 401);
        }
        
        console.log('User found:', { id: user.id, email: user.email });

        // Compare with password_hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', user.email);
            return sendError(res, 'Invalid credentials', ['Password mismatch'], 401);
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful for user:', user.email);

        // Return user info without sensitive data
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return sendError(res, 'Server error', process.env.NODE_ENV === 'development' ? [error.message] : [], 500);
    }
});

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify authentication token
 *     description: Verify if the provided JWT token is valid
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token (include 'Bearer ' prefix)
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid token or authentication required
 */

router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Authentication required', ['Token must start with Bearer '], 401);
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verify token first
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user information
        const user = await User.findById(decoded.id);
        if (!user) {
            return sendError(res, 'User not found', [], 401);
        }

        // If we reach here, token is valid
        return res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid authentication token' });
    }
});

module.exports = router;
