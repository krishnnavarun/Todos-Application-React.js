const express = require('express');
const { getTodos, getDeletedTodos, createTodo, updateTodo, deleteTodo, restoreTodo, permanentlyDeleteTodo } = require('../controllers/todoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// All todo routes require authentication
router.get('/', authenticateToken, getTodos);
router.get('/deleted/list', authenticateToken, getDeletedTodos);
router.post('/', authenticateToken, createTodo);
router.put('/:id', authenticateToken, updateTodo);
router.delete('/:id', authenticateToken, deleteTodo);
router.put('/:id/restore', authenticateToken, restoreTodo);
router.delete('/:id/permanent', authenticateToken, permanentlyDeleteTodo);

module.exports = router;
