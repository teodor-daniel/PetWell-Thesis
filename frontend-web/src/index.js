// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './contexts/AuthContext';
import axios from 'axios';
// import './App.css';         
import '@mantine/core/styles.css';

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <App/>
    </MantineProvider>
  </AuthProvider>
);
