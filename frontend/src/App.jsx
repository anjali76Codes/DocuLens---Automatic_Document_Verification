import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signin from './pages/Signin'; // Import Signin page
import LandingPage from './pages/LandingPage'; // Import LandingPage
import Signup from './pages/Signup'; // Import Signup page
import DocumentUpload from './pages/DocumentUpload'; // Import DocumentUpload component
import CameraCapture from './components/FaceDetection'; // Import CameraCapture component
import Navbar from './components/Navbar'; // Import Navbar component
import UserForm from './pages/UserForm'; // Import UserForm component
// import ImageVerification from './pages/ImageVerification'; // Import ImageVerification component
import OCRComponent from './components/OCRComponent';
import AadharUpload from './pages/AadharUpload'; // Update the import

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />  {/* Navbar at the top */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/camera-capture" element={<CameraCapture />} />
          <Route path="/upload" element={<DocumentUpload />} />  {/* Add the DocumentUpload route */}
          <Route path="/text-extract" element={<OCRComponent />} />  {/* Add the DocumentUpload route */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
