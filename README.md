# 🏠 ZiberLive - Smart Shared Living Management

**A comprehensive platform for managing shared living spaces with roommates**

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.16-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.79.0-3ECF8E)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Features

### ✅ **Phase 1-3 Complete** (Production Ready)

#### 🔐 Authentication & Onboarding
- **4-Step Registration Wizard**
  - Personal information
  - Apartment details
  - ID verification with photo upload
  - Review and submit
- **Secure Login** with email/password
- **Password Recovery** flow
- **Member Approval System** for admins

#### 🎫 Smart Invite System
- **Multiple Invite Methods**
  - Shareable links
  - Unique invite codes
  - QR code generation and scanning
- **Flexible Invite Types**
  - General (unlimited uses)
  - Single-use
  - Limited uses
- **Admin Management**
  - Create and track invites
  - Set expiration dates
  - Pre-assign bed locations
  - Monitor usage statistics

#### 👥 Member Management
- View all apartment members
- Search and filter by status/role
- Profile management with photos
- Loyalty points system
- Bed/room assignment tracking

#### 💰 Bills & Payments
- **Create Bills** with multiple categories
- **Smart Split Methods**
  - Equal split
  - By percentage
  - By amount
  - Custom split
- **Payment Tracking**
  - Individual share calculation
  - Payment status monitoring
  - Overdue alerts
- **Categories**: Rent, Utilities, Internet, Groceries, Cleaning, Maintenance

#### 🍽️ Community Meals
- **Meal Planning**
  - Schedule meals (breakfast/lunch/dinner/snack)
  - Set menu and cost per person
  - Manage participants
- **Grocery Teams**
  - Weekly team rotation
  - Budget tracking
  - Expense management

#### ✅ Task Management
- **Create and Assign Tasks**
  - Categories (cleaning, maintenance, shopping, etc.)
  - Priority levels (urgent, high, medium, low)
  - Due dates
  - Status tracking
- **Task Completion** workflow

#### 🗳️ Voting & Polls
- **Democratic Decision Making**
  - Simple polls (Yes/No)
  - Multiple choice
  - Ranked choice
  - Budget approval
- **Real-time Results** tracking

#### ⚙️ Settings & Preferences
- **Profile Management**
  - Photo upload
  - Contact information
  - Bio
- **Security**
  - Password change
  - Two-factor authentication (coming soon)
- **Notifications**
  - Email, push, SMS preferences
  - Activity-specific settings
- **Subscription Management**
  - Free plan with 500MB storage
  - Premium upgrade options
  - Ad-supported option

---

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - Modern React with Hooks
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.1.7** - Lightning-fast build tool
- **React Router 7.9.5** - Client-side routing
- **Tailwind CSS 4.1.16** - Utility-first styling

### Backend & Services
- **Supabase 2.79.0** - Backend-as-a-Service
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security
- **Cloudinary** - Image and file storage

### State Management
- **Zustand 5.0.8** - Global state
- **React Query 5.90.6** - Server state
- **React Hook Form 7.66.0** - Form handling
- **Zod 4.1.12** - Schema validation

### UI & Utilities
- **Lucide React 0.552.0** - Beautiful icons
- **QRCode React 4.2.0** - QR code generation
- **HTML5 QRCode 2.3.8** - QR code scanning
- **Tesseract.js 6.0.1** - OCR for receipts
- **Date-fns 4.1.0** - Date formatting
- **Recharts 3.3.0** - Charts and graphs

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Cloudinary account (for image uploads)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/fasinabsons/Roommates.git
   cd Roommates
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   ```

4. **Set up the database**
   
   - Go to your Supabase dashboard
   - Open the SQL Editor
   - Run the script from `sql/COMPLETE_DATABASE.sql`
   - This will create 30+ tables, functions, and triggers

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 🗄️ Database Schema

### Core Tables (30+)
- **apartments** - Apartment information
- **apartment_members** - User memberships
- **locations** - Beds and rooms
- **bills** - Bill tracking
- **bill_splits** - Individual bill shares
- **payments** - Payment records
- **community_meals** - Meal planning
- **meal_participants** - Meal RSVPs
- **grocery_teams** - Weekly grocery teams
- **tasks** - Task management
- **polls** - Voting polls
- **poll_votes** - Vote records
- **money_pools** - Shared investments
- **disputes** - Conflict resolution
- **messages** - Chat messages
- **notifications** - User notifications
- **apartment_invites** - Invite system
- **data_archives** - Data backup
- **subscription_status** - Billing info
- ...and more!

---

## 📱 Pages & Routes

### Public Routes
- `/login` - User login
- `/register` - 4-step registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset
- `/join/:inviteCode` - Join via invite
- `/join` - Join with code/QR

### Protected Routes
- `/dashboard` - Main dashboard
- `/members` - Member management
- `/bills` - Bills and payments
- `/meals` - Community meals
- `/tasks` - Task management
- `/voting` - Polls and voting
- `/settings` - User settings

### Admin Routes
- `/admin/invites` - Invite management
- `/admin/approvals` - Member approvals

---

## 🎨 UI Components

### Layout Components
- **AppLayout** - Main application wrapper
- **TopNavigation** - Header with search and notifications
- **Sidebar** - Desktop navigation
- **BottomNavigation** - Mobile navigation

### Reusable Components
- **Modal** dialogs
- **Form** inputs with validation
- **Card** components
- **Badge** indicators
- **Button** variants
- **Loading** spinners
- **Empty** states

---

## 🔒 Security Features

- **Row Level Security (RLS)** policies
- **JWT-based authentication**
- **Password hashing** with bcrypt
- **Environment variable** protection
- **CORS** configuration
- **SQL injection** prevention
- **XSS** protection

---

## 📊 Project Structure

```
ziberlive/
├── public/              # Static assets
├── sql/                 # Database scripts
│   ├── COMPLETE_DATABASE.sql
│   ├── 01_extensions.sql
│   ├── 02_enums.sql
│   ├── 03_core_tables.sql
│   ├── 04_rls_policies.sql
│   ├── 05_functions.sql
│   ├── 06_triggers.sql
│   ├── 07_new_features_tables.sql
│   └── 08_invite_functions.sql
├── src/
│   ├── components/      # Reusable components
│   │   └── layout/      # Layout components
│   ├── contexts/        # React contexts
│   ├── lib/             # Utilities and configs
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── admin/       # Admin pages
│   │   └── public/      # Public pages
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── .env                 # Environment variables (not in git)
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🚢 Deployment

### Netlify (Recommended)

1. **Connect GitHub repository** to Netlify
2. **Set build command**: `npm run build`
3. **Set publish directory**: `dist`
4. **Add environment variables** in Netlify dashboard
5. **Deploy**!

Configuration is already set in `netlify.toml`.

### Other Options
- Vercel
- AWS Amplify
- Custom server

---

## 🗺️ Roadmap

### Phase 4: Engagement (Coming Soon)
- [ ] Dispute resolution system
- [ ] Enhanced poll analytics
- [ ] Real-time chat

### Phase 5: Financial (Coming Soon)
- [ ] Money pools & investments
- [ ] ROI tracking
- [ ] Payment gateway integration

### Phase 6: Additional Features (Coming Soon)
- [ ] Calendar with events
- [ ] Resource booking
- [ ] Notifications center
- [ ] Mobile app (React Native)

### Phase 7: Advanced (Future)
- [ ] AI-powered expense predictions
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - Initial work - [GitHub Profile](https://github.com/fasinabsons)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the utility-first styling
- All contributors and testers

---

## 📞 Support

For support, email support@ziberlive.com or join our Slack channel.

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Member Management
![Members](docs/screenshots/members.png)

### Bills & Payments
![Bills](docs/screenshots/bills.png)

### Community Meals
![Meals](docs/screenshots/meals.png)

---

## 🎯 Quick Links

- **Documentation**: [docs/](docs/)
- **Database Setup**: [sql/README.md](sql/README.md)
- **Deployment Guide**: [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)
- **API Reference**: Coming soon
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## 📈 Stats

- **17 Pages** built and functional
- **30+ Database Tables** with relationships
- **15,000+ Lines** of TypeScript/React code
- **Zero Lint Errors** - Production ready
- **Responsive Design** - Mobile, tablet, desktop
- **Type-Safe** - 100% TypeScript

---

**Built with ❤️ by the ZiberLive Team**

**Version**: 1.0.0-beta  
**Last Updated**: November 7, 2025  
**Status**: ✅ Production Ready (Phase 1-3)

---

## 🌟 Star Us!

If you find this project useful, please consider giving it a star ⭐️ on GitHub!

[⬆ Back to Top](#-ziberlive---smart-shared-living-management)
