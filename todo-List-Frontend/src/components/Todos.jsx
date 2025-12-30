import { useState, useEffect } from 'react';
import { Trash2, LogOut, AlertCircle, RefreshCw, CheckCircle2, Circle } from 'lucide-react';

// For local development: http://localhost:3000
// For production: Update to your deployed backend URL

const API_URL = 'http://localhost:3000';

const Todos = ({ onLogout }) => {
  const [todoList, setTodoList] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTodos();
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
      setError('Failed to load todos. Make sure backend is running on localhost:3000');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
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
        }),
      });
      if (!response.ok) throw new Error('Failed to create todo');
      setUserInput('');
      setDescriptionInput('');
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
        await fetchTodos();
      } catch (err) {
        setError('Failed to delete todo');
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

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center" style={{
        backgroundImage: 'url(https://i.pinimg.com/1200x/da/a8/b0/daa8b0e1912ec2f457c519fb4fe5cc40.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <RefreshCw size={40} className="text-white animate-spin" />
          <p className="text-lg text-white font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen py-8 px-4 relative" style={{
      backgroundImage: 'url(https://i.pinimg.com/1200x/da/a8/b0/daa8b0e1912ec2f457c519fb4fe5cc40.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="absolute inset-0 bg-black/30 z-0"></div>
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
      </div>
      </div>
    </>
  );
};
export default Todos;