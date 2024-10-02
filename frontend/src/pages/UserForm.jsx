import React, { useState } from 'react';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../Firebase.js'; // Import the storage from firebase.js
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-toastify/dist/ReactToastify.css';

const UserForm = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.dob || !formData.gender || !selectedFile) {
      toast.error('Please fill all fields and upload Aadhar card before submitting.');
      return;
    }

    localStorage.setItem('userInfo', JSON.stringify(formData));
    setIsSubmitted(true);
    setUserDetails(formData);
    
    handleUpload();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError('');
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please choose a file first!');
      return;
    }

    const storageRef = ref(storage, `uploads/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast.error('Upload failed');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        toast.success('File uploaded successfully!');
        await handleExtractText(downloadURL);
      }
    );
  };

  const handleExtractText = async (imageUrl) => {
    setLoading(true);
    setError('');
  
    try {
      const formDataImage = new FormData();
      formDataImage.append('image', selectedFile);
      const response = await axios.post('http://localhost:3000/extract-text', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      const currentText = response.data.text;
      const formattedText = formatExtractedText(currentText);
      setExtractedText(formattedText);
  
      const { name, gender, dob } = parseExtractedText(formattedText);
      localStorage.setItem('extractedInfo', JSON.stringify({ name, gender, dob }));
  
      const userDetails = {
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        imageUrl,
        extractedInfo: { name, gender, dob },
      };
  
      await axios.post('http://localhost:3000/api/details', userDetails);
      toast.success('User details saved successfully!');
  
      // Navigate to /camera-capture after 2 seconds
      setTimeout(() => {
        navigate('/camera-capture'); // This line handles the navigation
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error('Error extracting text:', err);
      setError('Error extracting text. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const parseExtractedText = (text) => {
    const nameMatch = text.match(/(Yash Chetan Chavan|Anjali Ajaykumar Gupta)/);
    const genderMatch = text.match(/(Male|Female|Other)/i);
    const dobMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);

    const name = nameMatch ? nameMatch[0] : 'Not found';
    const gender = genderMatch ? genderMatch[0] : 'Not found';
    const dob = dobMatch ? dobMatch[0] : 'Not found';

    return { name, gender, dob };
  };

  const formatExtractedText = (text) => {
    const { name, gender, dob } = parseExtractedText(text);
    return `Name: ${name}\nGender: ${gender}\nDOB: ${dob}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-[#9A8C98] to-[#22223B]">
      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">User Information Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name (First Father Surname)"
              className="w-full p-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#4A4E69]"
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#4A4E69]"
              required
            />
          </div>

          <div className="mb-4">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#4A4E69]"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="fileInput"
              className="border-2 border-dashed border-[#4A4E69] p-4 rounded-lg m-4 flex flex-col justify-center align-middle bg-slate-100 cursor-pointer"
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
                accept=".jpg,.jpeg,.png,.pdf" // Accept image and PDF files
                required
              />
              <p className="text-center text-[#4A4E69] mt-2">
                {selectedFile ? selectedFile.name : 'Click to select Aadhar card'}
              </p>
            </label>
            {progress > 0 && (
              <div className="w-full mt-4">
                <div className="w-full h-6 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }} // Correctly using template literals
                  ></div>
                </div>
                <p className="text-center mt-2">{progress}%</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#22223B] text-white font-bold p-3 rounded-3xl shadow hover:bg-[#C9ADA7] hover:text-black transition duration-300"
          >
            Submit
          </button>
        </form>

        {isSubmitted && (
          <div className="mt-4 text-center">
            <p className="text-green-900 font-bold">Form submitted successfully!</p>
            <p className="mt-2 font-semibold">Full Name: {userDetails.fullName}</p>
          </div>
        )}

        {extractedText && (
          <div className="mt-4 text-left">
            <h3 className="font-semibold">Extracted Information:</h3>
            <pre className="bg-gray-100 p-4 rounded border border-gray-300">{extractedText}</pre>
          </div>
        )}

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {loading && <p className="mt-4 text-blue-600">Extracting text...</p>}
      </div>
      
    </div>
  );
};

export default UserForm;
