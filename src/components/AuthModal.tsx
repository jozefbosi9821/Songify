import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { api, isValidPassword } from '../services/api';

type ModalStep = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (username: string) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
    const [step, setStep] = useState<ModalStep>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [verifyToken, setVerifyToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState<{ valid: boolean; message: string }>({ valid: true, message: '' });

    useEffect(() => {
        if ((step === 'register' || step === 'reset-password') && password) {
            setPasswordValidation(isValidPassword(password));
        }
    }, [password, step]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep('login');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setResetToken('');
            setVerifyToken('');
            setError(null);
            setSuccessMessage(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if ((step === 'register' || step === 'reset-password') && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            switch (step) {
                case 'login':
                    const loginData = await api.login(username, password);
                    onLoginSuccess(loginData.username);
                    onClose();
                    break;

                case 'register':
                    await api.register(username, email, password);
                    setStep('verify-email');
                    setSuccessMessage('Account created! Check your email for verification.');
                    break;

                case 'verify-email':
                    await api.verifyEmail(verifyToken);
                    setSuccessMessage('Email verified! Please log in.');
                    setTimeout(() => {
                        setStep('login');
                        setSuccessMessage(null);
                    }, 2000);
                    break;

                case 'forgot-password':
                    await api.forgotPassword(email);
                    setSuccessMessage('If this email exists, a reset link has been sent.');
                    setTimeout(() => {
                        setStep('reset-password');
                        setSuccessMessage(null);
                    }, 2000);
                    break;

                case 'reset-password':
                    await api.resetPassword(resetToken, password);
                    setSuccessMessage('Password reset! Please log in.');
                    setTimeout(() => {
                        setStep('login');
                        setSuccessMessage(null);
                    }, 2000);
                    break;
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const backToLogin = () => {
        setStep('login');
        setError(null);
        setSuccessMessage(null);
    };

    const getTitle = () => {
        switch (step) {
            case 'login': return 'Welcome Back';
            case 'register': return 'Create Account';
            case 'forgot-password': return 'Reset Password';
            case 'reset-password': return 'Set New Password';
            case 'verify-email': return 'Verify Email';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[var(--border)] relative animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                >
                    <X size={20} />
                </button>

                {step !== 'login' && step !== 'register' && (
                    <button 
                        onClick={backToLogin}
                        className="absolute left-4 top-4 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">Back</span>
                    </button>
                )}

                <h2 className="text-2xl font-bold mb-6 text-center">
                    {getTitle()}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Login and Register: Username */}
                    {(step === 'login' || step === 'register') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Register and Forgot Password: Email */}
                    {(step === 'register' || step === 'forgot-password') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Password (all except verify-email) */}
                    {(step === 'login' || step === 'register' || step === 'reset-password') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all"
                                    placeholder={step === 'reset-password' ? 'Enter new password' : 'Enter your password'}
                                    required
                                />
                            </div>
                            {(step === 'register' || step === 'reset-password') && (
                                <p className={`text-xs ${passwordValidation.valid ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {passwordValidation.valid ? '✓ Strong password' : `⚠ ${passwordValidation.message}`}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Confirm Password for Register and Reset */}
                    {(step === 'register' || step === 'reset-password') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Verify Email Token */}
                    {step === 'verify-email' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Verification Token</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={verifyToken}
                                    onChange={(e) => setVerifyToken(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-lg py-2.5 px-4 outline-none transition-all"
                                    placeholder="Enter verification token from email"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Reset Password Token */}
                    {step === 'reset-password' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Reset Token</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                    className="w-full bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-lg py-2.5 px-4 outline-none transition-all"
                                    placeholder="Enter reset token from email"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[var(--accent)] text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Please wait...
                            </>
                        ) : (
                            step === 'login' ? 'Sign In' :
                            step === 'register' ? 'Sign Up' :
                            step === 'forgot-password' ? 'Send Reset Email' :
                            step === 'reset-password' ? 'Reset Password' :
                            'Verify Email'
                        )}
                    </button>
                </form>

                {/* Switch between login/register and forgot password */}
                {step === 'login' && (
                    <div className="mt-6 space-y-4 text-center text-sm text-[var(--text-secondary)]">
                        <button 
                            onClick={() => {
                                setStep('forgot-password');
                                setError(null);
                            }}
                            className="text-[var(--accent)] hover:underline font-medium"
                        >
                            Forgot password?
                        </button>
                        <div>
                            Don't have an account?{' '}
                            <button 
                                onClick={() => {
                                    setStep('register');
                                    setError(null);
                                    setPasswordValidation({ valid: true, message: '' });
                                }}
                                className="text-[var(--accent)] hover:underline font-medium"
                            >
                                Sign up
                            </button>
                        </div>
                    </div>
                )}

                {step === 'register' && (
                    <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                        Already have an account?{' '}
                        <button 
                            onClick={() => {
                                setStep('login');
                                setError(null);
                                setPasswordValidation({ valid: true, message: '' });
                            }}
                            className="text-[var(--accent)] hover:underline font-medium"
                        >
                            Sign in
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
