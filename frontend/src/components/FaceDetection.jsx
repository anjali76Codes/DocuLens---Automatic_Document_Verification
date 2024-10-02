import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import '../styles/FaceDetection.css';

const FaceDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const faceCanvasRef = useRef(null);
    const [message, setMessage] = useState("Click the button to start detecting faces.");
    const [detectedFaceImage, setDetectedFaceImage] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [currentDetection, setCurrentDetection] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [showAnimation, setShowAnimation] = useState(false);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [progress, setProgress] = useState(0);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isVideoStarted, setIsVideoStarted] = useState(false);
    const [warningMessage, setWarningMessage] = useState(null);
    const [detectedFaceDescriptor, setDetectedFaceDescriptor] = useState(null);

    const loadModels = async () => {
        const MODEL_URL = '/models';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
    };

    const startVideo = async () => {
        const permissionGranted = window.confirm("This app wants to access your camera. Allow?");
        if (permissionGranted) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                videoRef.current.onloadedmetadata = handleVideoPlay;
                setIsVideoStarted(true);
            } catch (err) {
                console.error(err);
                setMessage("Unable to access the camera.");
            }
        }
    };

    const handleVideoPlay = async () => {
        if (!modelsLoaded) {
            setMessage("Models are not loaded yet. Please wait.");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            if (video && !video.paused && !video.ended) {
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                if (detections.length === 1 && detections[0].detection.score > 0.5) {
                    setMessage("One clear face detected!");
                    setCurrentDetection(detections[0]);
                    setDetectedFaceDescriptor(detections[0].descriptor);
                    setWarningMessage(null);
                } else if (detections.length > 1) {
                    setMessage("Multiple faces detected!");
                    setWarningMessage("Only one person is allowed for the photograph. Please ensure only one person is in the frame.");
                    setCurrentDetection(null);
                } else {
                    setMessage("No clear face detected. Please adjust your position.");
                    setWarningMessage(null);
                }
            }
        }, 100);
    };

    const captureDetectedFace = () => {
        if (!currentDetection) return;

        const faceCanvas = faceCanvasRef.current;
        const context = faceCanvas.getContext('2d');
        const { x, y, width, height } = currentDetection.detection.box;

        faceCanvas.width = width;
        faceCanvas.height = height;
        context.drawImage(videoRef.current, x, y, width, height, 0, 0, width, height);

        const faceImageURL = faceCanvas.toDataURL();
        setDetectedFaceImage(faceImageURL);

        videoRef.current.pause();
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        setIsVideoStarted(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const extractFaceDescriptorFromImage = async (imageDataUrl) => {
        const img = await faceapi.fetchImage(imageDataUrl);
        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
        
        if (detections.length > 0) {
            return detections[0].descriptor; // Return the descriptor of the first detected face
        }
        return null;
    };

    const compareFaces = async () => {
        if (!detectedFaceDescriptor || !uploadedImage) return;

        setShowProgressBar(true);
        setProgress(0);

        const uploadedFaceDescriptor = await extractFaceDescriptorFromImage(uploadedImage);

        if (uploadedFaceDescriptor) {
            const distance = faceapi.euclideanDistance(detectedFaceDescriptor, uploadedFaceDescriptor);
            const threshold = 0.6; // Set a threshold for comparison

            setTimeout(() => {
                setShowProgressBar(false);
                if (distance < threshold) {
                    setComparisonResult("The faces match!");
                } else {
                    setComparisonResult("The faces do not match.");
                }
            }, 1000); // Simulate progress duration
        } else {
            setShowProgressBar(false);
            setComparisonResult("No face detected in the uploaded image.");
        }

        // Simulate progress bar
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 20; // Increment progress
            });
        }, 500); // Adjust the duration to simulate progress
    };

    useEffect(() => {
        loadModels();
    }, []);

    const triggerFileInput = () => {
        document.getElementById('fileInput').click();
    };

    return (
        <div className="flex flex-col items-center w-full">
        <section className='flex flex-row m-4 gap-6 mx-auto'>

        <div>
            <section
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="p-4 border-2 border-dashed border-gray-500 cursor-pointer rounded-3xl bg-slate-200"
                onClick={triggerFileInput}
            >
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
                <p className='text-center text-slate-500'><ion-icon name="cloud-upload" size="large"></ion-icon></p>
                <p className='text-center'>{uploadedImage ? "Image Uploaded" : "Drag & Drop or Click to Upload"}</p>
            </section>

            {uploadedImage && (
                <div className="flex flex-col mt-2 items-center">
                    <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="border border-gray-300"
                        style={{ width: '200px', height: 'auto' }}
                    />
                    <button
                        onClick={compareFaces}
                        className="mt-2 px-4 py-2 bg-[#4A4E69] text-white rounded-3xl hover:bg-[#22223B]"
                    >
                        Compare Faces
                    </button>
                </div>
            )}
        </div>

            <div>

            <div className="relative rounded-3xl border-2 border-[#22223B] overflow-hidden" style={{ width: '100%', maxWidth: '720px', height: 'auto' }}>
                {!isVideoStarted && !detectedFaceImage && (
                    <button
                        onClick={startVideo}
                        className="absolute inset-0 m-auto px-4 py-2 bg-[#4A4E69] text-white rounded-3xl hover:bg-[#22223B] transition z-50"
                        style={{ width: 'fit-content', height: 'fit-content' }}
                    >
                        Start Face Detection
                    </button>
                )}
                {!detectedFaceImage && (
                    <>
                        <video
                            ref={videoRef}
                            className="block w-full"
                            style={{ height: 'auto' }}
                            autoPlay
                            muted
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </>
                )}
                <canvas ref={faceCanvasRef} style={{ display: 'none' }} />
            </div>

            <div className="mt-4 text-center">
                <h2 className="text-lg font-bold">{message}</h2>
                {warningMessage && <p className="text-red-500">{warningMessage}</p>}
            </div>
            </div>
           
            {/* Flex container for video and uploaded image */}
            <div className="flex justify-center mt-4 space-x-4">
                <div>
                    {detectedFaceImage && (
                        <div>
                            <img
                                src={detectedFaceImage}
                                alt="Detected Face"
                                className="border border-gray-300"
                                style={{ width: '200px', height: 'auto' }}
                            />
                            <button
                                onClick={captureDetectedFace}
                                className="mt-2 px-4 py-2 bg-[#4A4E69] text-white rounded hover:bg-[#22223B]"
                            >
                                Capture Detected Face
                            </button>
                        </div>
                    )}
                </div>

                
            </div>
            </section>
            {/* New row for progress bar and comparison results */}
            <div className="mt-4 w-full text-center">
                {showProgressBar && (
                    <div className="mt-4 w-full">
                        <div className="bg-gray-200 rounded-full">
                            <div
                                className="bg-[#4A4E69] text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                                style={{ width: `${progress}%` }}
                            >
                                {progress}%
                            </div>
                        </div>
                    </div>
                )}

                {comparisonResult && (
                    <div className="mt-4 text-lg">
                        {comparisonResult}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceDetection;