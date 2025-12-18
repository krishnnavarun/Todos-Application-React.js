import { useRef, useState } from "react";
import RegisterForm from "./RegisterForm";

const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const passwordRef = useRef('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!email || !passwordRef.current.value) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: passwordRef.current.value
                })
            });

            const data = await response.json();
            console.log('Login Response:', data);

            if (response.ok && data.token) {
                // Save token to localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                console.log('Login successful! User:', data.user);
                setSuccess(`Welcome ${data.user.name}!`);
                
                // Clear form
                setEmail('');
                passwordRef.current.value = '';
                
                // Call the success callback to update App state
                setTimeout(() => {
                    onLoginSuccess();
                }, 500);
            } else {
                const errorMsg = data.error || 'Login failed';
                setError(errorMsg);
                console.error('Login error:', errorMsg);
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = 'Error logging in. Please make sure your backend is running on localhost:5000';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {showRegister ? (
                <RegisterForm onToggleForm={() => setShowRegister(false)} />
            ) : (
                <div className="w-96 flex flex-col justify-center items-center mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
                    <h1 className="font-bold text-4xl mb-8">Login</h1>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="border border-gray-300 m-3 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={email} 
                        onChange={handleEmailChange} 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="border border-gray-300 m-3 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                        ref={passwordRef} 
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                    <button 
                        className="bg-blue-600 text-white text-lg px-6 py-2 mt-5 rounded-lg mb-4 hover:bg-blue-700 disabled:bg-gray-400 w-full transition"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p className="text-gray-600 mb-3 text-sm">
                        Don't have an account? 
                        <button onClick={() => setShowRegister(true)} className="text-blue-600 hover:underline font-semibold ml-1">
                            Register here
                        </button>
                    </p>
                </div>
            )}
        </>
    )
}

export default LoginForm;
