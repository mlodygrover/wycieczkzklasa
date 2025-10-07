import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ScheduleProvider } from './roots/ScheduleContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScheduleProvider>
      <App />
    </ScheduleProvider>
  </React.StrictMode >
);

reportWebVitals();
