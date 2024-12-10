# Doculens - Automatic Document Verification

Doculens is an automated document verification system built using the MERN stack. It streamlines document verification processes by allowing users to verify Aadhar details, upload documents, extract text, and match facial data using the Face API. Admins can approve or reject verifications, ensuring a secure and efficient system.

## Features

- **Aadhar Verification**: Users upload their Aadhar card for initial verification.
- **Document Uploads**: Upload additional documents for automated text extraction and facial data verification.
- **Face API Matching**: Matches uploaded facial data with Aadhar card details.
- **Admin Dashboard**: Admins can approve or reject verifications and manage flagged mismatches.
- **User Notifications**: Real-time notification of verification results.
- **Verification Status**: Successfully verified documents are marked as "Verified," and mismatches are flagged as "Failed."

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **API Integration**: Microsoft Face API

## Installation

Follow these steps to set up the project on your local machine.

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or cloud instance)
- Microsoft Face API key

### Clone the Repository

```bash
git clone [https://github.com/anjali76Codes/DocuLens---Automatic_Document_Verification.git]
cd doculens
