import React, { useState } from 'react';
import Modal from './Modal';
import AuthForm, { AuthFormData } from './auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';

const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authModalMode, setAuthModalMode, login, signup } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AuthFormData) => {
    setError('');
    setIsLoading(true);

    try {
      if (authModalMode === 'signin') {
        const success = await login({ email: data.email, password: data.password });
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        const success = await signup({
          email: data.email,
          password: data.password,
          name: data.name!,
        });
        if (!success) {
          setError('User with this email already exists');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setAuthModalMode(authModalMode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  const handleClose = () => {
    setShowAuthModal(false);
    setError('');
  };

  return (
    <Modal isOpen={showAuthModal} onClose={handleClose}>
      <div className='p-8'>
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
          aria-label='Close modal'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <h2 className='text-3xl font-bold text-gray-900 mb-8 text-center'>
          {authModalMode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>

        <AuthForm mode={authModalMode} onSubmit={handleSubmit} error={error} isLoading={isLoading} />

        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            {authModalMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className='text-blue-600 hover:text-blue-700 font-medium transition-colors'>
              {authModalMode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
