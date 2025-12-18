import { useState, useEffect } from 'react';
import { Trash2, LogOut } from 'lucide-react';

const Todos = ({ onLogout }) => {
  const [todoList, setTodoList] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [todosCount, setTodosCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stringifiedTodoList = localStorage.getItem('todoList');
    const parsedTodoList = JSON.parse(stringifiedTodoList);
    if (parsedTodoList) {
      setTodoList(parsedTodoList);
      setTodosCount(parsedTodoList.length);
    }

    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const saveTodos = () => {
    localStorage.setItem('todoList', JSON.stringify(todoList));
  };

  const handleLogout = () => {
    onLogout();
  };

  const onAddTodo = () => {
    if (userInput.length === 0) {
      alert('Enter Valid Text');
      return;
    }

    const newTodo = {
      text: userInput,
      uniqueNo: todosCount + 1,
      isChecked: false,
    };

    setTodoList([...todoList, newTodo]);
    setTodosCount(todosCount + 1);
    setUserInput('');
  };

  const onTodoStatusChange = (todoId) => {
    setTodoList(
      todoList.map((todo) => {
        if (`todo${todo.uniqueNo}` === todoId) {
          return { ...todo, isChecked: !todo.isChecked };
        }
        return todo;
      })
    );
  };

  const onDeleteTodo = (todoId) => {
    setTodoList(
      todoList.filter((todo) => `todo${todo.uniqueNo}` !== todoId)
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onAddTodo();
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-medium text-center flex-1">Todos</h1>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-gray-700">Welcome, <span className="font-semibold">{user.name}</span></span>}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Create <span className="font-normal">Task</span>
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onAddTodo}
              className="px-6 py-3 bg-blue-700 text-white text-lg rounded-md hover:bg-blue-800 transition"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">
            My <span className="font-normal">Tasks</span>
          </h2>

          <ul className="space-y-4">
            {todoList.map((todo) => {
              const todoId = `todo${todo.uniqueNo}`;
              const checkboxId = `checkbox${todo.uniqueNo}`;
              const labelId = `label${todo.uniqueNo}`;

              return (
                <li
                  key={todoId}
                  id={todoId}
                  className="flex items-center gap-3 bg-white border-l-4 border-blue-600 rounded-md overflow-hidden shadow-sm"
                >
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={todo.isChecked}
                    onChange={() => onTodoStatusChange(todoId)}
                    className="w-6 h-6 ml-3 cursor-pointer accent-blue-600"
                  />

                  <label
                    htmlFor={checkboxId}
                    id={labelId}
                    className={`flex-1 px-4 py-3 cursor-pointer text-base ${
                      todo.isChecked
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </label>

                  <button
                    onClick={() => onDeleteTodo(todoId)}
                    className="px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              );
            })}
          </ul>

          {todoList.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No tasks yet. Add one to get started!
            </p>
          )}
        </div>

        <button
          onClick={saveTodos}
          className="w-full px-6 py-3 bg-blue-700 text-white text-lg rounded-md hover:bg-blue-800 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Todos;