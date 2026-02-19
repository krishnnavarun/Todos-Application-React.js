import { useState, useEffect } from 'react';
import { Trash2, LogOut, AlertCircle, RefreshCw, CheckCircle2, Circle, RotateCcw, Trash, Calendar, Clock, Archive, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Todos = ({ onLogout }) => {
  const [todoList, setTodoList] = useState([]);
  const [deletedTodoList, setDeletedTodoList] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showDeletedTasks, setShowDeletedTasks] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTodos();
    fetchDeletedTodos();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/todos`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      console.log('Fetched data:', data);
      // Extract todos from response object
      const todos = data.todos || [];
      console.log('Extracted todos:', todos);
      setTodoList(Array.isArray(todos) ? todos : []);
    } catch (err) {
      setError('Failed to load todos. Make sure backend is running on localhost:3001');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDeletedTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/todos/deleted/list`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch deleted todos');
      const data = await response.json();
      const todos = data.todos || [];
      setDeletedTodoList(Array.isArray(todos) ? todos : []);
    } catch (err) {
      console.error('Failed to fetch deleted todos:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodos(), fetchDeletedTodos()]);
  };

  const handleLogout = () => {
    onLogout();
  };

  const onAddTodo = async () => {
    if (userInput.length === 0) {
      setError('Please enter a task');
      return;
    }

    try {
      setError('');
      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: userInput.trim(),
          description: descriptionInput.trim(),
          priority: 'Medium',
          dueDate: dueDateInput || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create todo');
      setUserInput('');
      setDescriptionInput('');
      setDueDateInput('');
      await fetchTodos();
    } catch (err) {
      setError('Failed to create todo');
      console.error(err);
    }
  };

  const onTodoStatusChange = async (todoId) => {
    try {
      const todo = todoList.find((t) => t._id === todoId);
      if (todo) {
        // Update local state immediately (optimistic update)
        setTodoList(todoList.map(t => 
          t._id === todoId ? { ...t, isCompleted: !t.isCompleted } : t
        ));

        const response = await fetch(`${API_URL}/api/todos/${todoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            isCompleted: !todo.isCompleted,
          }),
        });
        if (!response.ok) throw new Error('Failed to update todo');
      }
    } catch (err) {
      setError('Failed to update todo');
      // Revert the change on error
      await fetchTodos();
      console.error(err);
    }
  };

  const onDeleteTodo = async (todoId) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        setDeleting((prev) => ({ ...prev, [todoId]: true }));
        const response = await fetch(`${API_URL}/api/todos/${todoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete todo');
        await Promise.all([fetchTodos(), fetchDeletedTodos()]);
      } catch (err) {
        setError('Failed to delete todo');
        console.error(err);
      } finally {
        setDeleting((prev) => ({ ...prev, [todoId]: false }));
      }
    }
  };

  const onRestoreTodo = async (todoId) => {
    try {
      setDeleting((prev) => ({ ...prev, [todoId]: true }));
      const response = await fetch(`${API_URL}/api/todos/${todoId}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to restore todo');
      await Promise.all([fetchTodos(), fetchDeletedTodos()]);
    } catch (err) {
      setError('Failed to restore todo');
      console.error(err);
    } finally {
      setDeleting((prev) => ({ ...prev, [todoId]: false }));
    }
  };

  const onPermanentlyDeleteTodo = async (todoId) => {
    if (window.confirm('Permanently delete this todo? This cannot be undone.')) {
      try {
        setDeleting((prev) => ({ ...prev, [todoId]: true }));
        const response = await fetch(`${API_URL}/api/todos/${todoId}/permanent`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) throw new Error('Failed to permanently delete todo');
        await fetchDeletedTodos();
      } catch (err) {
        setError('Failed to permanently delete todo');
        console.error(err);
      } finally {
        setDeleting((prev) => ({ ...prev, [todoId]: false }));
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onAddTodo();
    }
  };

  const completedCount = todoList.filter(t => t.isCompleted).length;
  const totalCount = todoList.length;

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !todoList.find(t => t._id === todoList._id && t.isCompleted);
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      }}>
        <style>{`
          @keyframes blob1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
            50% { transform: translate(30px, -30px) scale(1.1); opacity: 0.08; }
          }
          @keyframes blob2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
            50% { transform: translate(-30px, 30px) scale(1.1); opacity: 0.08; }
          }
          .blob1 {
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #3b82f6, transparent);
            border-radius: 50%;
            filter: blur(40px);
            animation: blob1 8s ease-in-out infinite;
            top: -100px;
            left: -100px;
          }
          .blob2 {
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #8b5cf6, transparent);
            border-radius: 50%;
            filter: blur(40px);
            animation: blob2 10s ease-in-out infinite;
            bottom: -100px;
            right: -100px;
          }
        `}</style>
        <div className="blob1"></div>
        <div className="blob2"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <RefreshCw size={40} className="text-white animate-spin" />
          <p className="text-lg text-white font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
    }}>
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
          50% { transform: translate(30px, -30px) scale(1.1); opacity: 0.08; }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
          50% { transform: translate(-30px, 30px) scale(1.1); opacity: 0.08; }
        }
        .blob1 {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #3b82f6, transparent);
          border-radius: 50%;
          filter: blur(50px);
          animation: blob1 8s ease-in-out infinite;
          top: -150px;
          left: -150px;
        }
        .blob2 {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          border-radius: 50%;
          filter: blur(50px);
          animation: blob2 10s ease-in-out infinite;
          bottom: -150px;
          right: -150px;
        }
      `}</style>
      <div className="blob1"></div>
      <div className="blob2"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-transparent z-0"></div>
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-white">Task Manager</h1>
            <p className="text-gray-200 mt-2">{completedCount} of {totalCount} completed</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-100">
                Welcome, <span className="font-semibold text-white">{user.name}</span>
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition"
              title="Refresh tasks"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Add Todo Section */}
        <div className="bg-white/95 rounded-xl shadow-sm p-6 mb-8 border border-indigo-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Task</h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            />
            <textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Add description (optional)"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition resize-none h-20"
            />
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg focus-within:border-indigo-500 focus-within:shadow-md transition">
                <Calendar size={20} className="text-indigo-600" />
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-gray-800"
                />
              </div>
              {dueDateInput && (
                <button
                  onClick={() => setDueDateInput('')}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={onAddTodo}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition w-full"
            >
              Add
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white/95 rounded-xl shadow-sm border border-indigo-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-indigo-200">
            <h2 className="text-xl font-bold text-gray-800">Your Tasks</h2>
          </div>

          {todoList.length === 0 ? (
            <div className="p-12 text-center">
              <Circle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todoList.map((todo) => (
                <li
                  key={todo._id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition ${
                    todo.isCompleted ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onTodoStatusChange(todo._id)}
                    className="flex-shrink-0 text-indigo-600 hover:text-indigo-700 transition"
                  >
                    {todo.isCompleted ? (
                      <CheckCircle2 size={24} className="text-green-500" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>

              {/* Task Title */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base font-medium ${
                        todo.isCompleted
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.dueDate && (
                      <div className={`flex items-center gap-1 mt-1 text-sm ${
                        isOverdue(todo.dueDate) ? 'text-red-600 font-semibold' :
                        isDueSoon(todo.dueDate) ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        <Clock size={14} />
                        <span>
                          {isOverdue(todo.dueDate) ? '⚠️ Overdue: ' : ''}
                          {formatDueDate(todo.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteTodo(todo._id)}
                    disabled={deleting[todo._id]}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                    title="Delete task"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Deleted Tasks Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowDeletedTasks(!showDeletedTasks)}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-gray-800 font-bold rounded-lg transition border border-red-300 shadow-sm"
          >
            <span className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Archive size={22} className="text-red-600" />
              </div>
              <span className="text-lg">Deleted Tasks ({deletedTodoList.length})</span>
            </span>
            <ChevronDown 
              size={24} 
              className={`text-red-600 transition-transform duration-300 ${showDeletedTasks ? 'rotate-180' : ''}`}
            />
          </button>

          {showDeletedTasks && (
            <div className="mt-4 bg-white/95 rounded-xl shadow-lg border border-red-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 flex items-center gap-3">
                <Archive size={24} className="text-red-600" />
                <h2 className="text-xl font-bold text-red-900">Deleted Tasks</h2>
              </div>

              {deletedTodoList.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <Archive size={32} className="text-red-300" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No deleted tasks</p>
                  <p className="text-gray-400 text-sm mt-2">Your deleted items will appear here</p>
                </div>
              ) : (
                <ul className="divide-y divide-red-100">
                  {deletedTodoList.map((todo) => (
                    <li
                      key={todo._id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition group"
                    >
                      <div className="flex-shrink-0">
                        <Archive size={20} className="text-red-400 group-hover:text-red-600" />
                      </div>
                      {/* Task Title */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-700 line-through text-gray-500">
                          {todo.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Deleted: {new Date(todo.deletedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => onRestoreTodo(todo._id)}
                          disabled={deleting[todo._id]}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition disabled:opacity-50 font-semibold"
                          title="Restore task"
                        >
                          <RotateCcw size={20} />
                        </button>
                        <button
                          onClick={() => onPermanentlyDeleteTodo(todo._id)}
                          disabled={deleting[todo._id]}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition disabled:opacity-50 font-semibold"
                          title="Permanently delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};
export default Todos;