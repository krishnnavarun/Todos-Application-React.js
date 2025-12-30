import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const API_URL = 'http://localhost:3000';

const RegisterForm = ({ onToggleForm }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const passwordRef = useRef('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
        
    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!name || !email || !passwordRef.current.value) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: passwordRef.current.value,
                    name: name.trim(),
                    role: role,
                }),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            console.log('Register Response:', data);

            if (data.token) {
                setSuccess('Registration successful! Redirecting to login...');
                // Clear form
                setName('');
                setEmail('');
                passwordRef.current.value = '';
                setRole('customer');
                
                setTimeout(() => {
                    onToggleForm();
                }, 1000);
            } else {
                setError('Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            const errorMsg = error.message || 'Error registering. Please make sure your backend is running on localhost:3000';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center relative" style={{
                backgroundImage: 'url(https://i.pinimg.com/1200x/da/a8/b0/daa8b0e1912ec2f457c519fb4fe5cc40.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="w-96 flex flex-col justify-center items-center p-6 bg-white shadow-lg rounded-xl relative z-10">
                <h1 className="font-bold text-4xl mb-8">Register</h1>
                <input 
                    type="text" 
                    placeholder="Name" 
                    className="border border-gray-300 m-3 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={name} 
                    onChange={handleNameChange} 
                />
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
                <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-gray-300 m-3 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                    <option value="customer">User</option>
                    <option value="admin">Admin</option>
                </select>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                <button 
                    className="bg-blue-600 text-white text-lg px-6 py-2 mt-5 rounded-lg mb-4 hover:bg-blue-700 disabled:bg-gray-400 w-full transition"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
                <p className="text-gray-600 mb-3 text-sm">
                    Already have an account? 
                    <button onClick={onToggleForm} className="text-blue-600 hover:underline font-semibold ml-1">
                        Login here
                    </button>
                </p>
                </div>
            </div>
        </>
    )
}

export default RegisterForm;
