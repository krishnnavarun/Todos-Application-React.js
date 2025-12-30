import { useRef, useState } from "react";
import RegisterForm from "./RegisterForm";
import { Eye, EyeOff } from "lucide-react";

const API_URL = 'http://localhost:3000';

const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const passwordRef = useRef('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: passwordRef.current.value,
                }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            console.log('Login Response:', data);

            if (data.token) {
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
                setError('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.message || 'Error logging in. Please make sure your backend is running on localhost:3000';
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
                <div className="min-h-screen flex items-center justify-center relative" style={{
                    backgroundImage: 'url(https://i.pinimg.com/1200x/da/a8/b0/daa8b0e1912ec2f457c519fb4fe5cc40.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="w-96 flex flex-col justify-center items-center p-6 bg-white shadow-lg rounded-xl relative z-10 overflow-hidden" style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%), url(https://www.transparenttextures.com/patterns/asfalt-light.png)',
                        backgroundBlend: 'overlay',
                    }}>
                    <h1 className="font-bold text-4xl mb-8">Login</h1>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="border border-gray-300 m-3 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={email} 
                        onChange={handleEmailChange} 
                    />
                    <div className="relative w-full m-3">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                            ref={passwordRef} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
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
                </div>
            )}
        </>
    )
}

export default LoginForm;