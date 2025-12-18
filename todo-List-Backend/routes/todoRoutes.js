const express = require('express');
const { getTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// All todo routes require authentication
router.get('/', authenticateToken, getTodos);
router.post('/', authenticateToken, createTodo);
router.put('/:id', authenticateToken, updateTodo);
router.delete('/:id', authenticateToken, deleteTodo);

module.exports = router;
