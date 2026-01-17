# Privacy & Data Flow Architecture

This document describes how the platform enforces privacy, data minimization, and user consent.

## Core Privacy Principles

1.  **No Direct Data Access**: Third-party applications CANNOT queries the `profiles` table directly. RLS policies block all public access.
2.  **Consent-First**: Access is only granted if a valid, active consent record exists in the `consents` table.
3.  **Data Minimization**: Only the specific fields allowed by the user (e.g., "Full Name" but not "Address") are returned.
4.  **Auditability**: Every access attempt, successful or denied, is irrecoverably logged to `access_logs`.

## The Secure Data Flow

### 1. User Grants Consent (Frontend -> Supabase)
-   **Actor**: Patient (User)
-   **Action**: Toggles a permission on the Dashboard.
-   **Mechanism**: Direct secure write to `consents` table.
-   **Security**: RLS Policy `"Users can manage own consents"` ensures users can only modify their own records.

### 2. Requesting Data (3rd Party App -> RPC)
-   **Actor**: Third-party Application (e.g., Hospital)
-   **Action**: Calls `rpc('request_patient_data', { patient_id, app_id })`.
-   **Mechanism**: Postgres Secure RPC (Stored Function).
-   **Process**:
    1.  **Lookup**: Resolves Patient ID to internal User ID.
    2.  **Check Consent**: Queries `consents` table for an active record matching User + App.
    3.  **Enforce**:
        -   If No Consent: Log "Denied" and return Error.
        -   If Consent Exists: Log "Success" with specific fields.
    4.  **Minimize**: detailed JSON construction returns *only* allowed fields.
    5.  **Return**: JSON payload to caller.

## Security Controls

| Component | Control | Purpose |
| :--- | :--- | :--- |
| **RLS Policies** | Database Engine | Prevents unauthorized SQL access to raw tables. |
| **Service Role** | `security definer` RPC | Allows the RPC to check consents that strictly the user owns, without giving the 3rd party direct table access. |
| **Access Logs** | Immutable Table | Forensic trail of who accessed what and when. |
| **UUIDs** | Random Identifiers | Prevents sequential ID guessing. |
