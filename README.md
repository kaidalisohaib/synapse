# Synapse - Curiosity Connector

Synapse is a pedagogical research platform designed as a socio-technical system to address "intellectual confinement" at McGill University. It functions as a "curiosity connector," facilitating one-on-one, interdisciplinary conversations between students.

## 🎯 Project Goals

- **Facilitate interdisciplinary learning** through automated student matching
- **Research tool** to study the impact of cross-faculty connections on student belonging and confidence
- **Minimize friction** in connecting curious students with knowledgeable peers
- **Privacy-first** design with double opt-in matching system

## ✨ Features

- 🔐 **Secure Authentication** using McGill email addresses
- 👤 **Comprehensive Profiles** with knowledge and curiosity tags
- 🤖 **Automated Matching Algorithm** prioritizing interdisciplinary connections
- 📧 **Email Notifications** for seamless communication flow
- 📊 **Admin Dashboard** for research data collection
- 🎨 **Clean, Academic Design** that gets out of the way

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Deployment**: Vercel

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synapse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Resend credentials

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL commands in `supabase-schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## 📖 How It Works

1. **Sign Up**: Students register with their McGill email
2. **Profile Setup**: Users add knowledge and curiosity tags
3. **Submit Request**: Users describe what they're curious about
4. **Automated Matching**: Algorithm finds the best interdisciplinary match
5. **Email Notification**: Matched student receives an invitation
6. **Double Opt-in**: Both parties must agree to connect
7. **Connection**: Contact information is shared for conversation

## 🔒 Privacy & Security

- Email verification required for all accounts
- Row Level Security (RLS) implemented in database
- No contact information shared until mutual consent
- McGill email domain validation
- Secure authentication via Supabase

## 📊 Research Features

- Anonymous data export for academic research
- Activity tracking for engagement analysis
- Feedback collection system
- Match success rate monitoring

## 🗂 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── signup/            # Registration page
│   └── profile/           # Profile management
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── Navbar.js         # Navigation component
└── lib/                  # Utility libraries
    ├── supabase/         # Database configuration
    └── resend.js         # Email configuration
```

## 🎨 Design Principles

- **Clarity over Clutter**: Every element has a clear purpose
- **Accessibility First**: WCAG 2.1 AA compliant
- **Mobile Responsive**: Seamless experience across devices
- **McGill Branding**: Professional, academic aesthetic

## 🔄 Development Status

This project is currently in development as part of an FSCI 398 research pilot. See [TASKS.md](./specs/TASKS.md) for detailed development progress.

## 📚 Documentation

- [Requirements](./specs/REQUIREMENTS.md) - Detailed functional requirements
- [Design System](./specs/DESIGN.md) - UI/UX specifications and database schema
- [Development Tasks](./specs/TASKS.md) - Project roadmap and task tracking
- [Setup Guide](./SETUP.md) - Complete installation instructions

## 🤝 Contributing

This is an academic research project. For questions or collaboration inquiries, please contact the research team.

## 📄 License

This project is part of academic research at McGill University. All rights reserved.