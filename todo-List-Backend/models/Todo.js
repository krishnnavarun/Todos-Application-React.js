const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        dueDate: {
            type: Date,
            default: null
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

todoSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
todoSchema.index({ userId: 1, isDeleted: 1, deletedAt: -1 });

const Todo = mongoose.model("todos", todoSchema);

module.exports = Todo;
