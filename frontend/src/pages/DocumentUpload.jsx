import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../Firebase.js'; 
import { ToastContainer, toast } from 'react-toastify'; 
import axios from 'axios'; 
import 'react-toastify/dist/ReactToastify.css';
import '../styles/UploadDoc.css';
import { useNavigate } from 'react-router-dom';

const Checkbox = ({ checked, onChange }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (checked) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [checked]);

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div className={`w-8 h-8 flex items-center justify-center border-2 rounded ${checked ? 'border-green-500 bg-green-100' : 'border-gray-400'} relative`}>
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div className={`checkmark ${checked ? 'animate-check' : ''}`}>
            ✔
          </div>
        )}
      </div>
    </label>
  );
};

const DocumentsComponent = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({
    gateScorecard: null,
    casteCertificate: null,
    pwdCertificate: null,
    ewsCertificate: null,
    experienceLetter: null,
  });
  const [uploadedDocs, setUploadedDocs] = useState({
    gateScorecard: false,
    casteCertificate: false,
    pwdCertificate: false,
    ewsCertificate: false,
    experienceLetter: false,
  });
  const [progress, setProgress] = useState(0);
  const [validity, setValidity] = useState({
    gateScorecard: true,
    casteCertificate: true,
    pwdCertificate: true,
    ewsCertificate: true,
    experienceLetter: true,
  });
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState({}); // Added state for managing open/close

  const loadLocalStorageData = () => {
    const storedInfo = localStorage.getItem('extractedInfo');
    return storedInfo ? JSON.parse(storedInfo) : {};
  };

  const handleFileChange = (event, docType) => {
    const file = event.target.files[0];
    if (file) {
      if (!documents[docType]) {
        setDocuments((prev) => ({ ...prev, [docType]: file }));
        handleUpload(file, docType);
      } else {
        toast.info(`You have already uploaded a ${docType.replace(/([A-Z])/g, ' $1')}.`);
      }
    }
  };

  const handleUpload = (fileToUpload, docType) => {
    const storageRef = ref(storage, `uploads/${docType}/${fileToUpload.name}`);
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
        toast.success(`${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully!`);

        setUploadedDocs((prev) => ({ ...prev, [docType]: true }));
        setDocuments((prev) => ({ ...prev, [docType]: { file: fileToUpload, url: downloadURL } }));
        setProgress(0);
        setIsSubmitted(true);

        handleExtractText(docType, fileToUpload);
      }
    );
  };

  const handleExtractText = async (docType, file) => {
    if (!file) {
      toast.error('Please upload a file for extraction.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:3000/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extractedInfo = response.data;
      const dob = extractDOB(extractedInfo.text);
      const localStorageData = loadLocalStorageData();
      const storedDob = localStorageData.dob;

      const isValid = storedDob === dob;
      setValidity((prev) => ({ ...prev, [docType]: isValid }));
    } catch (err) {
      console.error('Error extracting text:', err);
      toast.error('Error extracting text. Please try again.');
    }
  };

  const extractDOB = (text) => {
    const dobMatch = text.match(/(?:Date of Birth|DOB|DOB:|Date of birth|Date of Birth:)\s*(\d{2})[\/-](\d{2})[\/-](\d{4})|(\d{4})[\/-](\d{2})[\/-](\d{2})|(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})/i);
    if (dobMatch) {
      if (dobMatch[1] && dobMatch[2] && dobMatch[3]) {
        return `${dobMatch[1]}/${dobMatch[2]}/${dobMatch[3]}`; // dd/mm/yyyy
      } else if (dobMatch[4] && dobMatch[5] && dobMatch[6]) {
        return `${dobMatch[5]}/${dobMatch[6]}/${dobMatch[4]}`; // yyyy/mm/dd
      } else if (dobMatch[7] && dobMatch[8] && dobMatch[9]) {
        const year = parseInt(dobMatch[9], 10) < 50 ? `20${dobMatch[9]}` : `19${dobMatch[9]}`; // Assume 1900 or 2000
        return `${dobMatch[7]}/${dobMatch[8]}/${year}`; // dd/mm/yy
      }
    }
    return 'Not found';
  };

  const handleRemove = async (docType) => {
    const fileRef = ref(storage, `uploads/${docType}/${documents[docType].file.name}`);
    try {
      await deleteObject(fileRef);
      toast.success(`${docType.replace(/([A-Z])/g, ' $1')} removed successfully!`);
      setDocuments((prev) => ({ ...prev, [docType]: null }));
      setUploadedDocs((prev) => ({ ...prev, [docType]: false }));
      setValidity((prev) => ({ ...prev, [docType]: true })); // Reset validity when document is removed
    } catch (error) {
      console.error('Remove failed:', error);
      toast.error('Remove failed');
    }
  };

  const handleSubmit = () => {
    const localStorageData = loadLocalStorageData();
    const fullName = localStorageData.Name; 
    
    const documentsData = {
      gateScorecard: documents.gateScorecard?.url || null,
      casteCertificate: documents.casteCertificate?.url || null,
      pwdCertificate: documents.pwdCertificate?.url || null,
      ewsCertificate: documents.ewsCertificate?.url || null,
      experienceLetter: documents.experienceLetter?.url || null,
    };

    console.log("Submitting Documents:", documentsData);
    console.log("Submitted by:", fullName);

    const newSubmissionStatus = {};
    Object.keys(uploadedDocs).forEach(docType => {
      newSubmissionStatus[docType] = uploadedDocs[docType] ? 'Uploaded' : 'Not Uploaded';
    });
    
    setSubmissionStatus(newSubmissionStatus);
    toast.success('Documents submitted temporarily for review!');
  };

  const handleFinalSubmit = () => {
    navigate('/');
  };

  const renderDocumentUpload = (docType, label) => {
    const document = documents[docType];

    return (
      <div className="mb-4 m-20 justify-center align-middle items-center">
        <div 
          className="flex justify-between items-center cursor-pointer border-b"
          onClick={() => setIsOpen((prev) => ({ ...prev, [docType]: !prev[docType] }))}>
          <h2 className="text-lg font-semibold">{label}</h2>
          <span className='text-2xl'>{isOpen[docType] ? '-' : '+'}</span>
        </div>

        {isOpen[docType] && (
          <div className="pl-4 pt-2">
            <label className="flex-grow">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, docType)}
                style={{ display: 'none' }}
                id={docType}
              />
              <div
                onClick={() => document.getElementById(docType).click()}
                className="border border-gray-400 p-2 rounded-3xl w-[60%] mx-auto cursor-pointer text-center bg-[#4A4E69] text-white"
              >
                {document && document.file ? document.file.name : `Upload ${label}`}
              </div>
            </label>
            <div className="flex items-center mt-2">
              <Checkbox
                checked={uploadedDocs[docType]}
                onChange={() => {}}
              />
              <span className="ml-2">Uploaded</span>
              {document && (
                <div className="ml-2">
                  <button
                    onClick={() => handleRemove(docType)}
                    className="text-white bg-red-300 p-2 rounded-3xl hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            {document && (
              <div className="mt-2">
                {!validity[docType] ? (
                  <p className="text-red-500 bg-red-100 p-2 rounded-3xl">Document is incorrect.</p>
                ) : (
                  <p className="text-green-500 bg-green-100 p-2 rounded-3xl">Document is correct.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const isAllDocsUploaded = Object.values(uploadedDocs).every(Boolean);

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4 text-center font-bold">Upload Documents</h1>
      {renderDocumentUpload('gateScorecard', 'GATE Scorecard')}
      {renderDocumentUpload('casteCertificate', 'Caste Certificate')}
      {renderDocumentUpload('pwdCertificate', 'PWD Certificate')}
      {renderDocumentUpload('ewsCertificate', 'EWS Certificate')}
      {renderDocumentUpload('experienceLetter', 'Experience Letter')}

      {progress > 0 && (
        <div className="w-full h-4 bg-gray-200 rounded mt-2">
          <div
            className="h-full bg-green-500 rounded transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div> 
          <p className="text-center mt-1 text-sm">{progress}%</p>
        </div>
      )}

      {isAllDocsUploaded && (
        <button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white p-2 rounded">Submit</button>
      )}

      {isSubmitted && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Submission Status:</h3>
          <ul>
            {Object.entries(submissionStatus).map(([docType, status]) => (
              <li key={docType}>{docType.replace(/([A-Z])/g, ' $1')}: {status}</li>
            ))}
          </ul>
          <button onClick={handleFinalSubmit} className="mt-4 bg-green-500 text-white p-2 rounded">Final Submit</button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default DocumentsComponent;
