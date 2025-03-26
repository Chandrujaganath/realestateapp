# Real Estate Management System

A comprehensive system for managing real estate projects, visits, clients, and more.

## Features

- Multi-role user system (Guest, Client, Manager, Admin, Super Admin)
- Project and plot management
- Visit scheduling and approval
- Task assignment and tracking
- Attendance tracking with geofencing
- QR code generation for visits
- Real-time notifications
- Comprehensive reporting
- And much more!

## Getting Started

### Prerequisites

- Node.js 16+
- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/real-estate-app.git
cd real-estate-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Update the variables with your Firebase configuration

4. **Important**: Set up Firebase Admin SDK credentials

   - For detailed instructions, see [Firebase Admin Setup Guide](docs/firebase-admin-setup.md)
   - Without proper setup, API functions will use fallbacks in development mode

5. Start the development server:

```bash
npm run dev
```

## Documentation

Additional documentation is available in the `docs` directory:

- [Firebase Admin Setup](docs/firebase-admin-setup.md)
