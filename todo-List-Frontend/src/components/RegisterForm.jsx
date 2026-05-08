import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const RegisterForm = ({ onToggleForm }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const passwordRef = useRef('');
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
                }),
            });

            const data = await response.json();
            console.log('Register Response:', data, 'Status:', response.status);

            if (!response.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            if (data.token) {
                setSuccess('Registration successful! Redirecting to login...');
                // Clear form
                setName('');
                setEmail('');
                passwordRef.current.value = '';
                
                setTimeout(() => {
                    onToggleForm();
                }, 1000);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            const errorMsg = error.message || 'Error registering. Please make sure your backend is running on localhost:3001';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="min-h-screen relative px-4 py-10 lg:py-16">
                <div className="grain-overlay"></div>
                <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2 items-stretch slide-up">
                    <section className="frost-card rounded-3xl p-8 lg:p-10 text-white flex flex-col justify-between">
                        <div>
                            <p className="uppercase text-xs tracking-[0.18em] text-orange-100/80 mb-4">Smart Team Workflow</p>
                            <h1 className="text-4xl md:text-5xl leading-tight font-bold mb-4">Create your account and get work moving.</h1>
                            <p className="text-cyan-50/85 text-base md:text-lg">
                                Join your workspace, assign responsibility, and keep your priorities visible every day.
                            </p>
                        </div>
                        <div className="mt-8 grid gap-3 text-sm text-cyan-50/90">
                            <p className="rounded-xl bg-white/10 px-4 py-3 border border-white/15">Collaborate with role-based access.</p>
                            <p className="rounded-xl bg-white/10 px-4 py-3 border border-white/15">Review completed and archived tasks in one place.</p>
                        </div>
                    </section>

                    <section className="surface-card p-7 md:p-9 flex flex-col justify-center fade-in">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-slate-900">Create account</h2>
                            <p className="text-slate-500 mt-1">Set up your profile to start managing tasks.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                                    value={name}
                                    onChange={handleNameChange}
                                />
                            </div>

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
                                        placeholder="Create a password"
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
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>

                        <p className="text-slate-600 mt-5 text-sm">
                            Already have an account?
                            <button onClick={onToggleForm} className="ml-1 font-semibold text-cyan-700 hover:text-cyan-800">
                                Login here
                            </button>
                        </p>
                    </section>
                </div>
            </div>
        </>
    )
}

export default RegisterForm;
