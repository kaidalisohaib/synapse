# Project Synapse: Technical Requirements & MVP Scope

## 1. Project Overview

Synapse is a pedagogical research platform designed as a socio-technical system to address "intellectual confinement" at McGill University. It functions as a "curiosity connector," facilitating one-on-one, interdisciplinary conversations between students. The platform's primary goal is to serve as a research instrument to study the impact of these connections on student belonging, confidence, and interdisciplinary thinking.

## 2. Core Philosophy & Guiding Principles

-   **Facilitator, Not Gatekeeper:** The technology should be minimalist and its primary function is to scaffold a human connection, then get out of the way.
-   **Simplicity & Low Friction:** The user journey, from signup to conversation, must be as simple and fast as possible.
-   **Interdisciplinarity First:** The core matching logic must explicitly prioritize connections between students from different academic faculties.
-   **Privacy & Safety by Design:** The system will use a "double opt-in" model. No contact information is shared until both parties consent to a specific conversation.

## 3. Functional Requirements

### 3.1. User Authentication & Profiles
-   **[UR-1.1]** Users must be able to sign up for an account using their McGill email.
-   **[UR-1.2]** Users must be able to log in and log out securely.
-   **[UR-1.3]** Each user must have a profile with the following editable fields:
    -   `name`: (String)
    -   `faculty`: (String, dropdown of McGill faculties)
    -   `program`: (String)
    -   `year`: (String, e.g., "U1", "U2", "Grad")
    -   `knowledgeTags`: (Array of Strings) Topics the user enjoys talking about.
    -   `curiosityTags`: (Array of Strings) Topics the user is curious about.

### 3.2. Curiosity Requests
-   **[UR-2.1]** An authenticated user must be able to submit a "Curiosity Request."
-   **[UR-2.2]** A request consists of a single, free-text field where the user describes their question or topic of interest.
-   **[UR-2.3]** Each submitted request must be stored in the database, linked to the user who created it, and have a `status` field (e.g., "pending", "matched", "completed").

### 3.3. The Matching Engine (Automated)
-   **[UR-3.1]** The submission of a new Curiosity Request must automatically trigger the matching algorithm.
-   **[UR-3.2]** The algorithm must be a **rule-based, weighted scoring system** that runs on the backend.
-   **[UR-3.3]** The algorithm will iterate through all users (excluding the requester) and calculate a match score based on the following core rules:
    -   **Keyword Match (Knowledge):** +15 points for each of the user's `knowledgeTags` that appears in the request text.
    -   **Keyword Match (Curiosity):** +5 points for each of the user's `curiosityTags` that appears in the request text.
    -   **Faculty Bonus:** +25 points if the user's `faculty` is different from the requester's `faculty`.
    -   **Program Penalty:** -50 points if the user's `program` is the same as the requester's `program`.
-   **[UR-3.4]** The algorithm will identify the user with the highest score as the "best match."

### 3.4. Automated Email Notifications
-   **[UR-4.1]** Upon identifying a "best match," the system must automatically send an email to the matched student.
    -   This email must describe the request and contain a unique, secure link to "Accept" the conversation.
-   **[UR-4.2]** If the matched student clicks "Accept," the system must update the request's status and automatically send a final "Connection Email."
-   **[UR-4.3]** The "Connection Email" will be sent to *both* the requester and the matched student, formally introducing them and encouraging them to schedule a chat.

### 3.5. Admin Dashboard (For Research)
-   **[UR-5.1]** There must be a secure, admin-only interface.
-   **[UR-5.2]** The admin must be able to view a list of all users and their profiles.
-   **[UR-5.3]** The admin must be able to view a list of all conversation requests, their status, and the resulting matches.
-   **[UR-5.4]** The admin must be able to export anonymized data (e.g., number of inter-faculty connections) for research analysis.

## 4. Non-Functional Requirements

-   **[NFR-1] Usability:** The user interface must be clean, intuitive, and mobile-responsive.
-   **[NFR-2] Security:** User authentication must be handled by a secure, trusted provider (e.g., Supabase Auth). All API routes must be protected.
-   **[NFR-3] Performance:** Database queries should be optimized. The application should load quickly and respond instantly to user input.
-   **[NFR-4] Scalability:** The architecture should be serverless and able to handle a growing user base without significant rework.

## 5. Recommended Technical Stack

-   **Framework:** Next.js (React)
-   **Database & Auth:** Supabase
-   **Styling:** Tailwind CSS
-   **Transactional Email:** Resend
-   **Deployment:** Vercel

## 6. MVP Scope for FSCI 398 Pilot (Fall/Winter Term)

The goal of the first development phase is to build a functional, automated system to support the research pilot.

### Must-Haves for Pilot Launch:
-   [ ] Full User Authentication (Signup, Login, Profiles).
-   [ ] Functionality to create/edit profiles with Knowledge/Curiosity tags.
-   [ ] Functionality to submit a Curiosity Request.
-   [ ] A fully automated backend matching algorithm that runs on request submission.
-   [ ] A fully automated email notification system for the entire "double opt-in" flow.
-   [ ] A basic, functional Admin Dashboard to view users and requests.

### Nice-to-Haves (Post-Pilot / Future Development):
-   [ ] Public, browsable "Knowledge Hub" and "Curiosity Board" pages.
-   [ ] In-app notifications and a messaging system.
-   [ ] A user rating system for conversations to feed back into the algorithm.
-   [ ] Evolving the rule-based algorithm into a true Machine Learning model.
-   [ ] A full data visualization dashboard for the admin.