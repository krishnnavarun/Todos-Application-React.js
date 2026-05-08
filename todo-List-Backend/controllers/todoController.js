const Todo = require("../models/Todo");

const parseTodoUpdate = (input = {}) => {
    const update = {};

    if (input.title !== undefined) update.title = input.title;
    if (input.description !== undefined) update.description = input.description;
    if (input.isCompleted !== undefined) update.isCompleted = input.isCompleted;
    if (input.priority !== undefined) update.priority = input.priority;
    if (input.dueDate !== undefined) update.dueDate = input.dueDate;

    return update;
};

// Get all active todos for a user
const getTodos = async (req, res) => {
    try {
        const userId = req.user.id;
        const todos = await Todo.find({ userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .lean();
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
        const deletedTodos = await Todo.find({ userId, isDeleted: true })
            .sort({ deletedAt: -1 })
            .lean();
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
        const cleanTitle = String(title || "").trim();

        if (!cleanTitle) {
            return res.status(400).json({ error: "Title is required" });
        }

        const newTodo = new Todo({
            title: cleanTitle,
            description: String(description || "").trim(),
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
        const userId = req.user.id;
        const update = parseTodoUpdate(req.body);

        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: id, userId },
            update,
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ error: "Todo not found" });
        }

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

        const deletedTodo = await Todo.findOneAndUpdate(
            { _id: id, userId, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!deletedTodo) {
            return res.status(404).json({ error: "Todo not found" });
        }

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

        const restoredTodo = await Todo.findOneAndUpdate(
            { _id: id, userId, isDeleted: true },
            { isDeleted: false, deletedAt: null },
            { new: true }
        );

        if (!restoredTodo) {
            return res.status(404).json({ error: "Deleted todo not found" });
        }

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

        const todo = await Todo.findOneAndDelete({ _id: id, userId });
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

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
