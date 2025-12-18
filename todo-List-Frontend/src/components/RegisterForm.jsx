import { useRef, useState } from "react";

const RegisterForm = ({ onToggleForm }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const passwordRef = useRef('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: passwordRef.current.value
                })
            });

            const data = await response.json();
            console.log('Register Response:', data);

            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                // Clear form
                setName('');
                setEmail('');
                passwordRef.current.value = '';
                
                // Call callback after 1 second
                setTimeout(() => {
                    onToggleForm();
                }, 1000);
            } else {
                const errorMsg = data.error || 'Registration failed';
                setError(errorMsg);
                console.error('Register error:', errorMsg);
            }
        } catch (error) {
            console.error('Register error:', error);
            const errorMsg = 'Error registering. Please make sure your backend is running on localhost:5000';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="w-96 flex flex-col justify-center items-center mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
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
                    {loading ? 'Registering...' : 'Register'}
                </button>
                <p className="text-gray-600 mb-3 text-sm">
                    Already have an account? 
                    <button onClick={onToggleForm} className="text-blue-600 hover:underline font-semibold ml-1">
                        Login here
                    </button>
                </p>
            </div>
        </>
    )
}

export default RegisterForm;
