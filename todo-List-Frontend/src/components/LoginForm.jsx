import { useRef, useState } from "react";
import RegisterForm from "./RegisterForm";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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
            const errorMsg = error.message || 'Error logging in. Please make sure your backend is running on localhost:3001';
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
                <div className="min-h-screen relative px-4 py-10 lg:py-16">
                    <div className="grain-overlay"></div>
                    <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2 items-stretch slide-up">
                        <section className="frost-card rounded-3xl p-8 lg:p-10 text-white flex flex-col justify-between">
                            <div>
                                <p className="uppercase text-xs tracking-[0.18em] text-cyan-100/80 mb-4">Focused Productivity</p>
                                <h1 className="text-4xl md:text-5xl leading-tight font-bold mb-4">Plan your day with clarity and confidence.</h1>
                                <p className="text-cyan-50/85 text-base md:text-lg">
                                    Keep every task organized, visible, and actionable with a professional workspace built for speed.
                                </p>
                            </div>
                            <div className="mt-8 grid gap-3 text-sm text-cyan-50/90">
                                <p className="rounded-xl bg-white/10 px-4 py-3 border border-white/15">Track priorities and due dates with clean task cards.</p>
                                <p className="rounded-xl bg-white/10 px-4 py-3 border border-white/15">Archive and restore deleted tasks whenever you need.</p>
                            </div>
                        </section>

                        <section className="surface-card p-7 md:p-9 flex flex-col justify-center fade-in">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
                                <p className="text-slate-500 mt-1">Sign in to continue managing your tasks.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                                        value={email}
                                        onChange={handleEmailChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                                            ref={passwordRef}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                        >
                                            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
                                {success && <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{success}</p>}

                                <button
                                    className="w-full rounded-xl bg-cyan-700 text-white py-3 font-semibold transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <p className="text-slate-600 mt-5 text-sm">
                                Don't have an account?
                                <button
                                    onClick={() => setShowRegister(true)}
                                    className="ml-1 font-semibold text-cyan-700 hover:text-cyan-800"
                                >
                                    Register here
                                </button>
                            </p>
                        </section>
                    </div>
                </div>
            )}
        </>
    )
}

export default LoginForm;