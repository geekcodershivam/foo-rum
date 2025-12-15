import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm, { AuthFormData } from '../components/auth/AuthForm';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AuthFormData) => {
    setError('');
    setIsLoading(true);

    try {
      const success = await signup({
        email: data.email,
        password: data.password,
        name: data.name!,
      });

      if (success) {
        navigate('/');
      } else {
        setError('User with this email already exists');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Create your account</h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 animate-slide-up'>
          <AuthForm mode='signup' onSubmit={handleSubmit} error={error} isLoading={isLoading} />
          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Already have an account?</span>
              </div>
            </div>
            <div className='mt-6 text-center space-y-2'>
              <Link to='/signin' className='block font-medium text-blue-600 hover:text-blue-500 transition-colors'>
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
