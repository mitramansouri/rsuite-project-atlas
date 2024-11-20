import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ConfirmationPage from './ConfirmationPage';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);


