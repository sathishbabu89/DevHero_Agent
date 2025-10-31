import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { AuthProvider } from '../context/AuthContext';

// Mock API calls
jest.mock('../api/auth', () => ({
  login: jest.fn(),
}));

const renderWithProvider = (component) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('Login Form Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all required elements', () => {
    renderWithProvider(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderWithProvider(<LoginForm />);
    const user = userEvent.setup();
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('shows error for empty password', async () => {
    renderWithProvider(<LoginForm />);
    const user = userEvent.setup();
    
    const passwordInput = screen.getByLabelText(/password/i);
    await user.click(passwordInput);
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('enables submit button only when form is valid', async () => {
    renderWithProvider(<LoginForm />);
    const user = userEvent.setup();
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(submitButton).toBeEnabled();
  });

  test('handles successful login', async () => {
    const mockLogin = require('../api/auth').login;
    mockLogin.mockResolvedValue({ token: 'mock-jwt-token', user: { id: 1, email: 'test@example.com' } });
    
    renderWithProvider(<LoginForm />);
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('displays error message on login failure', async () => {
    const mockLogin = require('../api/auth').login;
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithProvider(<LoginForm />);
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});