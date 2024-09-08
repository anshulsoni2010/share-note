import React, { useState } from 'react';
import useStore from '../../lib/ZustStore';
import { account } from '../../lib/appwrite';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect or update UI on successful login
    } catch (error) {
      console.error('Login failed:', error);
      // Show error message to user
    }
  };

  const handleDirectLogin = async () => {
    try {
      const session = await account.createEmailSession(email, password);
      console.log('Session created:', session);
      const user = await account.get();
      console.log('User fetched:', user);
      // Handle successful login
    } catch (error) {
      console.error('Direct login failed:', error);
      // Handle error
    }
  };

  if (user) {
    return <div>You are already logged in as {user.email}</div>;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AuthPage;
