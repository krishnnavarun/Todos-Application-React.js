import { useState, useEffect } from 'react';
import {
  Trash2,
  LogOut,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
  RotateCcw,
  Calendar,
  Clock3,
  Archive,
  ChevronDown,
  Plus,
  ClipboardList,
  CheckCheck,
  ListTodo,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Todos = ({ onLogout, onOpenProfile }) => {
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
  const pendingCount = totalCount - completedCount;

  const isOverdue = (dueDate, isCompleted) => {
    if (!dueDate) return false;
    if (isCompleted) return false;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return new Date(dueDate) < endOfToday;
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
      <div className="min-h-screen px-4 py-10 relative flex items-center justify-center">
        <div className="grain-overlay"></div>
        <div className="surface-card px-8 py-10 text-center fade-in">
          <RefreshCw size={34} className="mx-auto mb-4 text-cyan-700 animate-spin" />
          <p className="text-slate-700 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-10 lg:py-12 relative">
      <div className="grain-overlay"></div>
      <div className="mx-auto max-w-6xl relative z-10 space-y-6 slide-up">
        <header className="frost-card rounded-3xl px-5 py-5 md:px-8 md:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="uppercase text-xs tracking-[0.18em] text-cyan-100/70 mb-1">Workspace Dashboard</p>
              <h1 className="text-3xl md:text-4xl text-white font-bold">Task Command Center</h1>
              <p className="text-cyan-50/80 mt-1 text-sm md:text-base">
                {completedCount} completed out of {totalCount} total tasks.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 md:items-center">
              {user && (
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white">
                  Signed in as <span className="font-semibold">{user.name}</span>
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition disabled:opacity-60"
                title="Refresh tasks"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={onOpenProfile}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white font-medium hover:bg-rose-700 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="surface-card p-5">
            <p className="text-sm text-slate-500 mb-2">Total Tasks</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-slate-900">{totalCount}</p>
              <ClipboardList className="text-cyan-700" size={26} />
            </div>
          </article>
          <article className="surface-card p-5">
            <p className="text-sm text-slate-500 mb-2">Completed</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
              <CheckCheck className="text-emerald-700" size={26} />
            </div>
          </article>
          <article className="surface-card p-5">
            <p className="text-sm text-slate-500 mb-2">Pending</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
              <ListTodo className="text-orange-700" size={26} />
            </div>
          </article>
        </section>

        {error && (
          <div className="surface-card p-4 border-red-200 bg-red-50/90 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <section className="surface-card p-5 md:p-7">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
            <Calendar size={22} className="text-cyan-700" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              />
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Description (optional)"
                className="w-full min-h-[96px] resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input
                type="date"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onAddTodo}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-cyan-700 text-white py-2.5 font-semibold hover:bg-cyan-800 transition"
                >
                  <Plus size={16} /> Add
                </button>
                <button
                  onClick={() => {
                    setUserInput('');
                    setDescriptionInput('');
                    setDueDateInput('');
                  }}
                  className="rounded-xl border border-slate-300 bg-white text-slate-700 py-2.5 font-semibold hover:bg-slate-100 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="px-5 md:px-7 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Active Tasks</h2>
            <span className="text-sm text-slate-500">{todoList.length} items</span>
          </div>

          {todoList.length === 0 ? (
            <div className="p-12 text-center">
              <Circle size={44} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-lg">No tasks yet. Add one to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {todoList.map((todo) => {
                const overdue = isOverdue(todo.dueDate, todo.isCompleted);
                const dueSoon = isDueSoon(todo.dueDate);

                return (
                  <li key={todo._id} className="px-5 md:px-7 py-4 hover:bg-slate-50/70 transition">
                    <div className="flex gap-3">
                      <button
                        onClick={() => onTodoStatusChange(todo._id)}
                        className="mt-0.5 flex-shrink-0 text-cyan-700 hover:text-cyan-800 transition"
                        title="Toggle completion"
                      >
                        {todo.isCompleted ? (
                          <CheckCircle2 size={23} className="text-emerald-600" />
                        ) : (
                          <Circle size={23} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className={`text-base md:text-lg font-semibold ${todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {todo.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {todo.dueDate && overdue && (
                              <span className="status-chip status-chip-danger">
                                <Clock3 size={13} /> Overdue
                              </span>
                            )}
                            {todo.dueDate && !overdue && dueSoon && (
                              <span className="status-chip status-chip-warning">
                                <Clock3 size={13} /> Due Soon
                              </span>
                            )}
                            {todo.dueDate && !overdue && !dueSoon && (
                              <span className="status-chip status-chip-neutral">
                                <Calendar size={13} /> Scheduled
                              </span>
                            )}
                          </div>
                        </div>

                        {todo.description && (
                          <p className="text-slate-500 text-sm mt-1 leading-relaxed">{todo.description}</p>
                        )}

                        {todo.dueDate && (
                          <p className="text-slate-500 text-xs mt-2">Due: {formatDueDate(todo.dueDate)}</p>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteTodo(todo._id)}
                        disabled={deleting[todo._id]}
                        className="flex-shrink-0 self-start rounded-lg p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="surface-card overflow-hidden mb-6">
          <button
            onClick={() => setShowDeletedTasks(!showDeletedTasks)}
            className="w-full px-5 md:px-7 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition"
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-100 text-rose-700">
                <Archive size={18} />
              </span>
              <span>
                <span className="block text-lg font-semibold text-slate-900">Deleted Tasks</span>
                <span className="block text-xs text-slate-500">{deletedTodoList.length} archived items</span>
              </span>
            </span>
            <ChevronDown size={22} className={`text-slate-500 transition-transform ${showDeletedTasks ? 'rotate-180' : ''}`} />
          </button>

          {showDeletedTasks && (
            <div className="border-t border-slate-200">
              {deletedTodoList.length === 0 ? (
                <div className="p-10 text-center">
                  <Archive size={36} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No deleted tasks right now.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {deletedTodoList.map((todo) => (
                    <li key={todo._id} className="px-5 md:px-7 py-4 flex items-center gap-3 hover:bg-slate-50/70 transition">
                      <Archive size={16} className="text-rose-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-500 font-medium line-through">{todo.title}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Deleted: {new Date(todo.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onRestoreTodo(todo._id)}
                          disabled={deleting[todo._id]}
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 px-3 py-1.5 text-cyan-700 hover:bg-cyan-50 transition disabled:opacity-50"
                          title="Restore task"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button
                          onClick={() => onPermanentlyDeleteTodo(todo._id)}
                          disabled={deleting[todo._id]}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                          title="Permanently delete"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default Todos;