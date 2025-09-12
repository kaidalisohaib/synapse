# Project Synapse: Development Tasks & Project Board

This document tracks the development progress for the Synapse MVP. It is organized into Epics (major features) and individual tasks.

## Project Status

-   **To Do:** 44 tasks
-   **In Progress:** 0 tasks
-   **Done:** 0 tasks

---

## Epic 0: Project Setup & Foundation (`E-0`)

*Objective: Initialize the project, set up the tech stack, and establish the design system.*

### To Do

-   [ ] **[T-01]** Initialize a new Next.js project.
-   [ ] **[T-02]** Set up and configure Supabase for database and authentication.
-   [ ] **[T-03]** Integrate Tailwind CSS and configure `tailwind.config.js`.
-   [ ] **[T-04]** Set up and configure Resend for transactional emails.
-   [ ] **[T-05]** Create the database schema in Supabase (`profiles`, `requests`, `matches`) as defined in `DESIGN.md`.
-   [ ] **[T-06]** Build the main reusable components (`Navbar`, `Button`, `Modal`) as a basic component library.
-   [ ] **[T-07]** Set up Vercel for continuous deployment from a Git repository (e.g., GitHub).

---

## Epic 1: User Authentication & Profiles (`E-1`)

*Objective: Allow users to create accounts, log in, and manage their profile data.*

### To Do

-   [ ] **[T-08]** Create a public "Sign Up" page with a form that integrates with Supabase Auth. (Ref: UR-1.1)
-   [ ] **[T-09]** Create a public "Log In" page with a form that integrates with Supabase Auth. (Ref: UR-1.2)
-   [ ] **[T-10]** Implement logic to automatically create a corresponding `profile` in the database upon new user signup.
-   [ ] **[T-11]** Create a protected "Dashboard" page that is only accessible to logged-in users.
-   [ ] **[T-12]** Create a protected "Edit Profile" page that displays the `ProfileForm` component. (Ref: UR-1.3)
-   [ ] **[T-13]** Implement the `TagInput` component for `knowledgeTags` and `curiosityTags`.
-   [ ] **[T-14]** Implement the backend logic to save updated profile information to the Supabase database.
-   [ ] **[T-15]** Implement the "Log Out" functionality.

---

## Epic 2: The Curiosity & Matching Engine (`E-2`)

*Objective: Allow users to submit curiosity requests and implement the automated matching logic.*

### To Do

-   [ ] **[T-16]** Create a protected "Make a Request" page with the `RequestForm` component. (Ref: UR-2.1)
-   [ ] **[T-17]** Implement the backend logic to save a new request to the `requests` table in the database. (Ref: UR-2.2)
-   [ ] **[T-18]** Create a new backend API route (e.g., `/api/match-request`) that will be triggered on request submission. (Ref: UR-3.1)
-   [ ] **[T-19]** Implement the core keyword extraction logic from the request text within the API route.
-   [ ] **[T-20]** Implement the full rule-based scoring algorithm as defined in `REQUIREMENTS.md`. (Ref: UR-3.3)
-   [ ] **[T-21]** Implement logic to save the best match to the `matches` table with a "notified" status.

---

## Epic 3: The Automated Notification System (`E-3`)

*Objective: Create the fully automated, touchless email notification flow.*

### To Do

-   [ ] **[T-22]** Integrate the Resend SDK into the backend.
-   [ ] **[T-23]** Design and build the email template for the initial match notification.
-   [ ] **[T-24]** Trigger the initial notification email to the matched user from the `/api/match-request` route. (Ref: UR-4.1)
-   [ ] **[T-25]** Create a new protected page that a user lands on when they click the "Accept" link from the email.
-   [ ] **[T-26]** Create a new backend API route (e.g., `/api/confirm-match`) that is called from the acceptance page.
-   [ ] **[T-27]** Implement logic in the confirm route to update the match status and trigger the final connection email. (Ref: UR-4.2)
-   [ ] **[T-28]** Design and build the email template for the final "You're Connected!" email. (Ref: UR-4.3)

---

## Epic 4: Admin & Research Tools (`E-4`)

*Objective: Build the necessary backend tools to manage the pilot and gather research data.*

### To Do

-   [ ] **[T-29]** Create a secure admin dashboard, accessible only to a specific user role. (Ref: UR-5.1)
-   [ ] **[T-30]** Build the admin view to list all users and all conversation requests with their current status. (Ref: UR-5.2, UR-5.3)

---

## Epic 5: Security & Compliance (`E-5`)

*Objective: Implement security measures, privacy compliance, and robust error handling.*

### To Do
-   [ ] **[T-31]** Implement email verification system for new user signups.
-   [ ] **[T-32]** Add API rate limiting and abuse prevention middleware.
-   [ ] **[T-33]** Create privacy policy and terms of service pages.
-   [ ] **[T-34]** Implement comprehensive error handling for all edge cases.
-   [ ] **[T-35]** Add logging and monitoring for system health and user activities.
-   [ ] **[T-36]** Implement GDPR-compliant data export and deletion features.

---

## Epic 6: User Experience Enhancements (`E-6`)

*Objective: Improve user onboarding and feedback mechanisms.*

### To Do
-   [ ] **[T-37]** Create interactive onboarding tutorial for new users.
-   [ ] **[T-38]** Implement tag suggestion system based on faculty/program.
-   [ ] **[T-39]** Add post-conversation feedback collection system.
-   [ ] **[T-40]** Create user dashboard showing conversation history and statistics.

---

## Epic 7: Deployment & Launch (`E-7`)

*Objective: Final testing and launching the pilot for the student cohort.*

### To Do
-   [ ] **[T-41]** Conduct end-to-end testing of the entire user flow.
-   [ ] **[T-42]** Set up production environment variables in Vercel (e.g., Supabase keys, Resend API key).
-   [ ] **[T-43]** Final deployment to the production URL (`synapse.mcgill.ca` or similar).
-   [ ] **[T-44]** Prepare onboarding materials for the pilot student cohort.