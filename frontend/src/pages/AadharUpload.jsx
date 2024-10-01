import React, { useState } from 'react';
import axios from 'axios';

const AadharUpload = () => {
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [extractedData, setExtractedData] = useState(null); // State to hold extracted data

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const validFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];

        if (selectedFile) {
            const isValidType = validFileTypes.includes(selectedFile.type);
            const isValidName = selectedFile.name.toLowerCase().includes('aadhar');

            if (!isValidType) {
                setErrorMessage('Please upload only your Aadhar card in PDF, JPEG, or PNG format.');
                setFile(null);
            } else if (!isValidName) {
                setErrorMessage('Please ensure the file name contains "Aadhar".');
                setFile(null);
            } else {
                setErrorMessage('');
                setFile(selectedFile);
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (file) {
            const formData = new FormData();
            formData.append('aadharCard', file);

            try {
                // Change to the correct port
                const response = await axios.post('http://localhost:3000/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setSuccessMessage(response.data.message);
                setExtractedData(response.data.data);
                setFile(null);
            } catch (error) {
                if (error.response && error.response.data) {
                    setErrorMessage('Failed to upload Aadhar card: ' + error.response.data);
                } else {
                    setErrorMessage('Failed to upload Aadhar card: ' + error.message);
                }
            }
        } else {
            setErrorMessage('Please upload your Aadhar card.');
        }
    };


    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Upload Aadhar Card</h1>
            <form onSubmit={handleUpload} className="flex flex-col items-center">
                <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="border border-gray-300 rounded p-2 mb-4"
                />
                {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
                {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
                <button
                    type="submit"
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                    Upload
                </button>
            </form>
            <p className="mt-4 text-gray-600 text-center">
                *Please ensure the file name contains "Aadhar" and is in PDF, JPEG, or PNG format.
            </p>

            {/* Display extracted data if available */}
            {extractedData && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold">Extracted Information:</h2>
                    <p><strong>Name:</strong> {extractedData.name}</p>
                    <p><strong>DOB:</strong> {new Date(extractedData.dob).toLocaleDateString()}</p>
                    <p><strong>Gender:</strong> {extractedData.gender}</p>
                </div>
            )}
        </div>
    );
};

export default AadharUpload;
