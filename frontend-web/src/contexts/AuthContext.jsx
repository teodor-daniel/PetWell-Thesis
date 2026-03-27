/**
 * AuthContext.jsx — unified login / auto-login for OWNER, USER and VET
 * ---------------------------------------------------------------
 *  • Uses HTTP-only cookies for JWT storage (secure)
 *  • Only stores user session data in localStorage (not tokens)
 *  • Relies on backend cookie management for authentication
 */

import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

/* ---------- normalize every backend response into one shape ---------- */
const buildSession = ({ token, user, vet, primaryClinicId }) => {
  if (vet) {
    return {
      id: vet.id,
      role: 'VET',
      clinicId: primaryClinicId,             
      clinicIds: vet.clinicIds ?? [],         
      email: vet.email.toLowerCase(),
      fullName: vet.fullName,
    };
  }
  return {
    id: user.id,
    role: user.role,                       
    email: user.email.toLowerCase(),
    fullName: user.fullName,
  
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//Auto-login
  useEffect(() => {
    const bootstrap = async () => {
      console.log('AuthContext bootstrap starting...');
      
      /* 1) Try to resurrect a cached session (user data only, no tokens) */
      const cached = localStorage.getItem('session');
      // console.log('Cached session:', cached);
      
      if (cached) {
        try {
          const session = JSON.parse(cached);
          console.log('Using cached session:', session);
          setUser(session);
          setLoading(false);
          return;
        } catch (e) { 
          console.log('Corrupted cached session, falling through to backend');
        }
      }

      /* 2) No cache → ask backend if a cookie is alive */
      // console.log('Calling /auth/user endpoint...');
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/user`,
          { withCredentials: true }
        );
        // console.log('Backend response:', data);
        const session = buildSession(data);
        setUser(session);
        localStorage.setItem('session', JSON.stringify(session));
      } catch (err) {
        // console.log('Backend call failed:', err.response?.status, err.response?.data);
        setUser(null);
        localStorage.removeItem('session');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);


  const login = async ({ email, password, keepLoggedIn }) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password, keepLoggedIn },
        { withCredentials: true }
      );

      const session = buildSession(data);
      localStorage.setItem('session', JSON.stringify(session));

      setUser(session);
      return { success: true, user: session };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

//Vet Login
  const vetLogin = async ({ email, password, keepLoggedIn }) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/vet/login`,
        { email, password, keepLoggedIn },
        { withCredentials: true }
      );

      const session = buildSession({
        token: data.token,
        vet: data.vet,
        primaryClinicId: data.primaryClinicId,
      });
      localStorage.setItem('session', JSON.stringify(session));

      setUser(session);
      return { success: true, user: session };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

//Logout
  const logout = () => {
    localStorage.removeItem('session');
    axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {}, { withCredentials: true })
      .finally(() => { setUser(null); });
  };

//Helper
  const updateUser = (next) => {
    setUser(prev => {
      const updated = { ...prev, ...next };
      localStorage.setItem('session', JSON.stringify(updated));
      return updated;
    });
  };

//Context Value
  return (
    <AuthContext.Provider value={{
      user, loading, error,
      login, vetLogin,
      logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
