import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Static data for recruitment cards
const recruitments = [
    {
        id: 1,
        title: "Engineer Recruitment",
        description: "Looking for skilled engineers for various positions.",
        eligibility: "B.E/B.Tech in relevant fields.",
        datePosted: "2024-10-01",
    },
    {
        id: 2,
        title: "Scientist Recruitment",
        description: "Join us as a scientist in the defense sector.",
        eligibility: "M.Sc. or PhD in relevant fields.",
        datePosted: "2024-09-15",
    },
    {
        id: 3,
        title: "Software Developer Recruitment",
        description: "Seeking experienced software developers.",
        eligibility: "B.E/B.Tech in Computer Science or related fields.",
        datePosted: "2024-09-25",
    },
    {
        id: 4,
        title: "Research Analyst Recruitment",
        description: "Looking for research analysts for our projects.",
        eligibility: "Postgraduate degree in relevant fields.",
        datePosted: "2024-09-10",
    },
];

const RecruitmentDashboard = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleApplyNow = () => {
        navigate('/upload'); // Navigate to the upload page
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Recruitment Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recruitments.map(recruitment => (
                    <div key={recruitment.id} className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold">{recruitment.title}</h2>
                        <p className="mt-2 text-gray-600">{recruitment.description}</p>
                        <p className="mt-4 font-bold">Eligibility: <span className="font-normal">{recruitment.eligibility}</span></p>
                        <p className="mt-1 font-bold">Date Posted: <span className="font-normal">{new Date(recruitment.datePosted).toLocaleDateString()}</span></p>
                        <button
                            onClick={handleApplyNow}
                            className="mt-4 inline-block bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700">
                            Apply Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecruitmentDashboard;
