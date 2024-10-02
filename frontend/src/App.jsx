import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signin from './pages/Signin';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import DocumentUpload from './pages/DocumentUpload';
import CameraCapture from './components/FaceDetection';
import Navbar from './components/Navbar';
import OCRComponent from './components/OCRComponent';
import RecruitmentDashboard from './pages/RecruitmentDashboard'; // Import the new component
import UserForm from './pages/UserForm';
import Home from './pages/Home';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />}/>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/camera-capture" element={<CameraCapture />} />
          <Route path="/upload" element={<DocumentUpload />} />
          <Route path="/text-extract" element={<OCRComponent />} />
          <Route path="/recruitment-dashboard" element={<RecruitmentDashboard />} /> {/* Add the RecruitmentDashboard route */}
          <Route path="/user-form" element={<UserForm />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;