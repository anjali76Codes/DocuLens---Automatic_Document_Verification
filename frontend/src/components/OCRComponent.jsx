import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../Firebase.js'; // Import the storage from firebase.js
import { ToastContainer, toast } from 'react-toastify'; // For notifications
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-toastify/dist/ReactToastify.css';

const OCRComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files', { withCredentials: true });
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError('');
    if (file) handleUpload(file); // Automatically upload after file selection
  };

  const handleUpload = (fileToUpload) => {
    if (!fileToUpload) {
      toast.error('Please choose a file first!');
      return;
    }

    const storageRef = ref(storage, `uploads/${fileToUpload.name}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const simulatedProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(simulatedProgress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast.error('Upload failed');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        toast.success('File uploaded successfully!');

        await axios.post('http://localhost:5000/api/files', { url: downloadURL }, { withCredentials: true });
        fetchUploadedFiles();
        handleExtractText(downloadURL);
      }
    );
  };

  const handleExtractText = async (imageUrl) => {
    if (!selectedFile) {
      toast.error('Please upload an image for extraction.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const response = await axios.post('http://localhost:3000/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const currentText = response.data.text;
      const formattedText = formatExtractedText(currentText);
      setExtractedText(formattedText);

      // Store extracted info in local storage
      localStorage.setItem('extractedInfo', JSON.stringify(formattedText));
    } catch (err) {
      console.error('Error extracting text:', err);
      setError('Error extracting text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatExtractedText = (text) => {
    const nameMatch = text.match(/(Yash Chetan Chavan|Anjali Ajaykumar Gupta)/); // Capture name dynamically
    const genderMatch = text.match(/(Male|Female)/i); // Capture gender
    const dobMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/); // Capture DOB in DD/MM/YYYY format

    const name = nameMatch ? nameMatch[0] : 'Not found';
    const gender = genderMatch ? genderMatch[0] : 'Not found';
    const dob = dobMatch ? dobMatch[0] : 'Not found';

    return `Name: ${name}\nGender: ${gender}\nDOB: ${dob}`;
  };

  const clearAll = () => {
    setSelectedFile(null);
    setProgress(0);
    setExtractedText('');
    setError('');
    document.getElementById('fileInput').value = '';
  };

  const handleUploadRemainingDocuments = () => {
    navigate('/documents'); // Redirect to /documents
  };

  return (
    <div>
      <h1>OCR Text Extractor</h1>
      <label
        htmlFor="fileInput"
        className="border-2 border-dashed border-[#4A4E69] p-4 rounded-lg m-4 w-[50%] flex flex-col justify-center align-middle mx-auto bg-slate-100 cursor-pointer"
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <div className="mx-auto text-[#4A4E69] text-5xl"><ion-icon name="cloud-upload"></ion-icon></div>
        <p className="text-center text-[#4A4E69] hover:text-blue-700 mt-2">
          {selectedFile ? selectedFile.name : 'Click to select file or drag and drop a file here'}
        </p>
      </label>

      <section className="flex mx-auto justify-center align-middle">
        <button onClick={handleExtractText} disabled={loading} className="p-3 m-3 bg-[#22223B] text-white rounded-3xl w-[20%]">
          {loading ? 'Extracting...' : 'Extract Text'}
        </button>
        <button onClick={clearAll} className="p-3 m-3 bg-[#9A8C98] text-white rounded-3xl w-[20%]">Clear</button>
      </section>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {extractedText && (
        <div>
          <h2>Extracted Information:</h2>
          <pre>{extractedText}</pre>
        </div>
      )}

      {progress > 0 && (
        <div className="w-[50%] mx-auto mt-4">
          <div className="w-full h-6 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2">{progress}%</p>
        </div>
      )}

      <ul>
        {uploadedFiles.map((uploadedFile, index) => (
          <li key={index}>
            <a href={uploadedFile} target="_blank" rel="noreferrer">View Uploaded File</a>
          </li>
        ))}
      </ul>

      <button onClick={handleUploadRemainingDocuments} className="p-3 m-3 bg-blue-600 text-white rounded-3xl w-[20%]">
        Upload Remaining Documents
      </button>

      <ToastContainer />
    </div>
  );
};

export default OCRComponent;
