# PrivID - Privacy-Centric Healthcare Identity Platform

A React + Supabase application designed to demonstrate a user-first approach to healthcare data privacy. This platform enables patients to manage their digital identity and control exactly who accesses their medical records through granular consent mechanisms.

## 🚀 Key Features

*   **Granular Consent**: Patients can grant or revoke access to specific data fields (Name, DOB, Address) for individual applications or doctors.
*   **Role-Based Access Control (RBAC)**: Distinct roles for Patients (Citizens) and Doctors, enforced via Row Level Security (RLS) in Supabase.
*   **Audit Logs**: Immutable logs of all data access attempts, providing transparency to the patient.
*   **Privacy First**: No default access. Data is encrypted and protected by default. Access must be explicitly granted.

## 🛠 Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons)
*   **Backend**: Supabase (PostgreSQL, Auth, RLS)
*   **Routing**: React Router v7
*   **Deployment**: Vercel / Netlify (Ready)

## 🏗 Architecture Overview

The application follows a standard SPA (Single Page Application) architecture:

1.  **Authentication**: Handled by Supabase Auth (Email/Password). Sessions are persisted in local storage.
2.  **State Management**: React Context (`AuthContext`, `ToastContext`) for global state.
3.  **Data Access**: Direct calls to Supabase client from React components. Security is enforced on the database side using RLS policies, ensuring a compromised frontend cannot bypass privacy rules.

### Database Schema (Simplified)

*   `profiles`: Stores user data (encrypted sensitive fields).
*   `consents`: Stores active permissions for external applications.
*   `doctor_consents`: Stores active permissions for specific doctors.
*   `access_logs`: Records every read operation on patient data.
*   `applications`: Registry of third-party apps requesting access.

## 🔒 Privacy & Security Design

### verification of Consent
Before any data is returned to a doctor or app, the backend (via PostgreSQL policies) checks:
1.  Is there an active consent record?
2.  Does the consent record include the requested fields?
3.  Is the requester who they say they are?

### Transparency
Every successful access is logged to the `access_logs` table. Patients can view this in the **Audit Logs** section of their dashboard to see exactly who accessed what and when.

## 💻 Developer Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd hack_app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

To verify the privacy flows:
1.  **Sign up** as a new user (Patient).
2.  Go to **Consent** and grant access to a mock application or doctor.
3.  Check **Access Logs** to see if any activity appears (in a real scenario, this would be populated when the doctor actually views the data).
4.  Revoke access and confirm the status changes to "Revoked".

---
*Built for the Agentic Coding Challenge.*
