import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: AuthFormData) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, error, isLoading = false }) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof AuthFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'signup' && (
        <Input
          id="name"
          type="text"
          label="Name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="John Doe"
          required={mode === 'signup'}
        />
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange('email')}
        placeholder="you@example.com"
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        value={formData.password}
        onChange={handleChange('password')}
        placeholder="••••••••"
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-slide-down">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default AuthForm;