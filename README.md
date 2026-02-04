# Oocyte Bank Management System

This is the source code for my thesis project: "An AI-Based System for Oocyte Banks: Post-Retrieval Oocyte Eligibility Decision Support for Donors and Recipients". The system facilitates the management of oocyte donation and retrieval processes and includes machine learning capabilities for automated oocyte evaluation and classification.

## Overview

The Oocyte Bank Management System is a web-based application designed to support oocyte bank operations. It provides separate interfaces for patients (donors and recipients) and administrative staff, enabling efficient management of patient records, appointments, oocyte retrieval batches, and automated evaluation of oocyte images using computer vision.

The system processes microscopic images of oocytes and uses a trained machine learning model to detect and classify oocytes based on their maturity stage and quality. This automated evaluation helps staff make informed decisions about oocyte viability and storage eligibility.

## How It Works

The system operates through a three-tier architecture:

1. **Image Upload and Batch Creation**: Staff members upload microscopic images of oocytes during retrieval procedures. These images are organized into batches associated with specific patients and retrieval sessions.

2. **Automated Evaluation**: Once a batch is created, staff can initiate an evaluation process. The system processes each image using a machine learning model (Detectron2) that detects oocytes in the images and classifies them based on maturity stages (MII, MI) and quality indicators (normal, abnormal).

3. **Results and Management**: Evaluation results are stored and displayed to both patients and staff. Patients can view their oocyte records and journey progress, while staff can manage all aspects of the process including patient records, appointments, and batch evaluations.

The evaluation process runs asynchronously using Celery, allowing the system to handle multiple batches simultaneously without blocking the main application.

## Project Structure

The project is organized into three main components:

### BE (Backend)
The backend is built with FastAPI (Python) and handles all server-side logic, API endpoints, and data processing. It includes:
- RESTful API endpoints for patient management, appointments, batch processing, and evaluations
- Firebase integration for authentication and database operations
- Celery workers for asynchronous image processing tasks
- Machine learning inference service using Detectron2
- JWT-based authentication system

### FE_client (Client Frontend)
A React-based web application for patients (donors and recipients). This interface allows patients to:
- Register and manage their accounts
- View their oocyte records and evaluation results
- Track their journey through the oocyte bank process
- Schedule and manage appointments

### FE_admin (Admin Frontend)
A React-based web application for administrative staff. This interface provides:
- Patient management and record keeping
- Batch creation and management
- Image upload and evaluation initiation
- Dashboard with statistics and analytics
- Staff management capabilities

## Prerequisites

Before running the project, ensure you have the following installed:

- Python 3.8 or higher
- Node.js 16 or higher and npm
- Redis (for Celery task queue)
- Firebase project with Firestore database enabled
- Firebase service account credentials file

## Cloning the Repository

To clone this repository, run:

```
git clone <repository-url>
cd egg-bank
```

## Setting Up the Backend

1. Navigate to the backend directory:
```
cd BE
```

2. Create a virtual environment (recommended):
```
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:
```
venv\Scripts\activate
```
- On macOS/Linux:
```
source venv/bin/activate
```

4. Install Python dependencies:
```
pip install -r requirements.txt
```

5. Set up environment variables:
Create a `.env` file in the `BE` directory with the following variables:
```
FIREBASE_API_KEY=your_firebase_api_key
JWT_SECRET=your_jwt_secret_key
FIREBASE_CRED_PATH=serviceAccount.json
STORAGE_DIR=./storage
MODEL_PATH=app/models/model_final.pth
MODEL_DEVICE=cuda
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

6. Place your Firebase service account credentials file (`serviceAccount.json`) in the `BE` directory.

7. Start Redis server (required for Celery):
- On Windows: Download and run Redis from the official website
- On macOS: `brew install redis` then `redis-server`
- On Linux: `sudo apt-get install redis-server` then `redis-server`

8. Start the Celery worker (in a separate terminal):
```
celery -A app.tasks.celery_app worker --loglevel=info
```

9. Start the FastAPI server:
```
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`.

## Setting Up the Client Frontend

1. Navigate to the client frontend directory:
```
cd FE_client
```

2. Install dependencies:
```
npm install
```

3. Configure the API endpoint in `src/config/api.js` if needed (defaults to `http://localhost:8000`).

4. Start the development server:
```
npm run dev
```

The client frontend will be available at `http://localhost:5173`.

## Setting Up the Admin Frontend

1. Navigate to the admin frontend directory:
```
cd FE_admin
```

2. Install dependencies:
```
npm install
```

3. Configure the API endpoint in `src/config/api.js` if needed (defaults to `http://localhost:8000`).

4. Start the development server:
```
npm run dev
```

The admin frontend will be available at `http://localhost:5174`.

## Running the Complete System

To run the entire system:

1. Start Redis server
2. Start the Celery worker (from `BE` directory)
3. Start the FastAPI backend server (from `BE` directory)
4. Start the client frontend (from `FE_client` directory)
5. Start the admin frontend (from `FE_admin` directory)

All services should be running simultaneously for the system to function properly. The frontend applications communicate with the backend API, and the backend uses Celery workers to process image evaluations asynchronously.

## Notes

- Ensure that the machine learning model file (`model_final.pth`) is present in `BE/app/models/` before running evaluations.
- The storage directory (`BE/storage`) will be created automatically for storing uploaded images.
- Make sure Firebase Firestore database is properly configured and accessible with the provided service account credentials.
- For production deployment, update CORS origins in the backend configuration and use appropriate environment variables.
