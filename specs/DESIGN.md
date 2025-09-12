# Project Synapse: Design System & Architecture

## 1. Design Philosophy & Principles

The design of Synapse must be clean, minimalist, academic, and trustworthy. The user interface should feel like an extension of the McGill environment—professional and calm, not like a flashy social media app. The core principle is: **"The design should get out of the way,"** allowing the user's curiosity and the human connection to be the main focus.

-   **Clarity over Clutter:** Every element must have a clear purpose. White space is our most important tool.
-   **Accessibility First:** The design must be accessible, with high-contrast text and keyboard-navigable elements.
-   **Mobile-Responsive:** The experience must be seamless on all devices, from a phone to a desktop.

## 2. Visual Identity

### 2.1. Color Palette
The palette will use a neutral base with McGill's red as a key accent for calls-to-action.

-   **Primary Background:** `#FFFFFF` (White) / Subtle Gray `#F9FAFB`
-   **Primary Text:** `#111827` (Almost Black)
-   **Secondary Text:** `#6B7280` (Gray)
-   **Accent (Buttons, Links):** `#EE3124` (McGill Red)
-   **Success:** `#10B981` (Green)
-   **Error:** `#EF4444` (Red, slightly different from accent)

### 2.2. Typography
-   **Font:** `Inter` (sans-serif) loaded from Google Fonts, or a system font stack for simplicity.
-   **Headings (`<h1>`, `<h2>`):** Font-weight `600` (Semibold)
-   **Body Text (`<p>`):** Font-weight `400` (Regular)
-   **Buttons & Links:** Font-weight `500` (Medium)

### 2.3. Logo
For the MVP, the logo will be a simple text-based mark: **"Synapse"** in a clean, semibold font.

## 3. Layout & Wireframe

The application will use a standard, consistent layout across all pages.

-   **Navbar:** A fixed header containing the Synapse logo, navigation links, and a user profile/login button.
-   **Main Content:** A centered, max-width container (`max-w-4xl`) where the primary page content will be displayed.
-   **Footer:** A simple footer with basic information or links.

## 4. Component Breakdown

The UI will be built using a modular, reusable component system (ideal for React/Next.js).

| Component | Description | Props (Inputs) |
| :--- | :--- | :--- |
| **`Navbar`** | The main site navigation. Displays different links if the user is logged in or out. | `user` |
| **`Button`** | A reusable button with different styles. | `variant` ('primary', 'secondary'), `onClick`, `children` |
| **`ProfileForm`**| A form for creating and editing a user's profile information. | `user`, `onSave` |
| **`TagInput`** | A specialized input field for adding/removing `knowledgeTags` and `curiosityTags`. | `tags`, `setTags` |
| **`RequestForm`**| The main form for submitting a new "Curiosity Request." | `onSubmit` |
| **`Modal`** | A generic pop-up modal for confirmations or displaying match results. | `isOpen`, `onClose`, `children` |
| **`Spinner`** | A loading indicator to show when data is being fetched or processed. | |

## 5. Core User Flow: "From Curiosity to Connection"

This flow describes the journey of a user from submitting a request to being connected.

1.  **Dashboard:** After logging in, the user lands on a simple dashboard. The most prominent element is a call-to-action leading to the `RequestForm`.
2.  **Submission:** The user fills out the `RequestForm`, describing their curiosity.
3.  **Backend Trigger (Invisible):** Upon submission, the backend matching algorithm is triggered automatically.
4.  **Notification (Email):** The best-matched student receives a professionally formatted email (via Resend) with details about the request and a single, clear "Accept" button/link.
5.  **Confirmation (Web):** Clicking the link opens a simple, secure page in the Synapse app that confirms their acceptance.
6.  **Connection (Email):** Upon confirmation, a final connection email is sent to both students, officially introducing them.

## 6. Database Schema (Supabase / PostgreSQL)

This schema defines the structure of the data in the database.

### `profiles` table
Linked one-to-one with Supabase's `auth.users` table.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (FK) | References `auth.users.id`. Primary Key. |
| `name` | `TEXT` | User's full name. |
| `faculty` | `TEXT` | e.g., "Science", "Arts" |
| `program` | `TEXT` | e.g., "Cognitive Science" |
| `year` | `TEXT` | e.g., "U1", "U3" |
| `knowledgeTags` | `TEXT[]` | An array of strings. |
| `curiosityTags` | `TEXT[]` | An array of strings. |
| `email_verified` | `BOOLEAN` | Whether email has been verified. Default: false. |
| `profile_completed` | `BOOLEAN` | Whether user has completed profile setup. Default: false. |
| `created_at` | `TIMESTAMPTZ` | Account creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Last profile update timestamp. |

### `requests` table
Stores all submitted curiosity requests.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `requester_id` | `UUID` (FK) | References `profiles.id`. |
| `request_text`| `TEXT` | The full text of the user's curiosity. |
| `status` | `TEXT` | "pending", "matched", "confirmed", "completed" |
| `created_at` | `TIMESTAMPTZ` | Timestamp of creation. |

### `matches` table
Tracks the state of a match between a request and a user.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `request_id` | `UUID` (FK) | References `requests.id`. |
| `matched_user_id`| `UUID` (FK) | References `profiles.id`. |
| `status` | `TEXT` | "notified", "accepted", "declined", "expired" |
| `match_score` | `INTEGER` | The computed matching score for this pairing. |
| `expires_at` | `TIMESTAMPTZ` | When the match offer expires if not accepted. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of creation. |
| `updated_at` | `TIMESTAMPTZ` | Last status update timestamp. |

### Additional Tables for Enhanced Features

### `conversation_feedback` table
Stores post-conversation feedback for algorithm improvement.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `match_id` | `UUID` (FK) | References `matches.id`. |
| `feedback_rating` | `INTEGER` | 1-5 rating of conversation quality. |
| `feedback_text` | `TEXT` | Optional text feedback. |
| `submitted_by` | `UUID` (FK) | References `profiles.id`. |
| `created_at` | `TIMESTAMPTZ` | Feedback submission timestamp. |

### `user_activity` table
Tracks user engagement for analytics.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key. |
| `user_id` | `UUID` (FK) | References `profiles.id`. |
| `activity_type` | `TEXT` | "login", "profile_update", "request_submitted", etc. |
| `metadata` | `JSONB` | Additional activity context. |
| `created_at` | `TIMESTAMPTZ` | Activity timestamp. |