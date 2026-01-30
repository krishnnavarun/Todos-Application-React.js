const Todo = require("../models/Todo");

// Get all active todos for a user
const getTodos = async (req, res) => {
    try {
        const userId = req.user.id;
        const todos = await Todo.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Todos fetched successfully",
            todos
        });
    } catch (err) {
        console.error("Get todos error:", err);
        res.status(500).json({ error: "Failed to fetch todos" });
    }
};

// Get all deleted todos for a user
const getDeletedTodos = async (req, res) => {
    try {
        const userId = req.user.id;
        const deletedTodos = await Todo.find({ userId, isDeleted: true }).sort({ deletedAt: -1 });
        return res.status(200).json({
            message: "Deleted todos fetched successfully",
            todos: deletedTodos
        });
    } catch (err) {
        console.error("Get deleted todos error:", err);
        res.status(500).json({ error: "Failed to fetch deleted todos" });
    }
};

// Create a new todo
const createTodo = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const newTodo = new Todo({
            title,
            description: description || "",
            priority: priority || "Medium",
            dueDate: dueDate || null,
            userId
        });

        const todo = await newTodo.save();
        return res.status(201).json({
            message: "Todo created successfully",
            todo
        });
    } catch (err) {
        console.error("Create todo error:", err);
        res.status(500).json({ error: "Failed to create todo" });
    }
};

// Update a todo
const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, isCompleted, priority, dueDate } = req.body;
        const userId = req.user.id;

        const todo = await Todo.findOne({ _id: id, userId });
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        if (title !== undefined) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (isCompleted !== undefined) todo.isCompleted = isCompleted;
        if (priority !== undefined) todo.priority = priority;
        if (dueDate !== undefined) todo.dueDate = dueDate;

        const updatedTodo = await todo.save();
        return res.status(200).json({
            message: "Todo updated successfully",
            todo: updatedTodo
        });
    } catch (err) {
        console.error("Update todo error:", err);
        res.status(500).json({ error: "Failed to update todo" });
    }
};

// Soft delete a todo (move to trash)
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const todo = await Todo.findOne({ _id: id, userId });
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        todo.isDeleted = true;
        todo.deletedAt = new Date();
        const deletedTodo = await todo.save();

        return res.status(200).json({
            message: "Todo deleted successfully",
            todo: deletedTodo
        });
    } catch (err) {
        console.error("Delete todo error:", err);
        res.status(500).json({ error: "Failed to delete todo" });
    }
};

// Restore a deleted todo
const restoreTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const todo = await Todo.findOne({ _id: id, userId, isDeleted: true });
        if (!todo) {
            return res.status(404).json({ error: "Deleted todo not found" });
        }

        todo.isDeleted = false;
        todo.deletedAt = null;
        const restoredTodo = await todo.save();

        return res.status(200).json({
            message: "Todo restored successfully",
            todo: restoredTodo
        });
    } catch (err) {
        console.error("Restore todo error:", err);
        res.status(500).json({ error: "Failed to restore todo" });
    }
};

// Permanently delete a todo
const permanentlyDeleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const todo = await Todo.findOne({ _id: id, userId });
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        await Todo.deleteOne({ _id: id });
        return res.status(200).json({
            message: "Todo permanently deleted successfully",
            todo
        });
    } catch (err) {
        console.error("Permanently delete todo error:", err);
        res.status(500).json({ error: "Failed to permanently delete todo" });
    }
};

module.exports = { getTodos, getDeletedTodos, createTodo, updateTodo, deleteTodo, restoreTodo, permanentlyDeleteTodo };
