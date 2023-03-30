import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppMain from './components/AppMain'

export default function App() {
  return (
    <BrowserRouter>
      < Routes>
        <Route path="/" element={<AppMain mode='0' />} />
        <Route path="/simulation1" element={<AppMain mode='1' />} />
        <Route path="/simulation2" element={<AppMain mode='2' />} />
      </Routes>
  </BrowserRouter>
  );
}

