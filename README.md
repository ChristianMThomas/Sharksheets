# SharkSheets - Mobile Planner App

A beautiful mobile planner app built with React Native, Expo, and Firebase, Simple design and intuitive user experience.

## Features

- **User Authentication**: Sign in with email/password or Google authentication
- **Landing Page**: Welcoming home screen with quick actions
- **Monthly Calendar View**: Navigate through months and view entries at a glance
- **Day Entry Form**: Add names, locations, and working hours for each day
- **PDF Generation**: Export your planner to PDF for sharing
- **Cloud Sync**: All data synced with Firebase Firestore
- **Beautiful UI**: Purple-themed design with NativeWind/Tailwind CSS

## Tech Stack

- React Native
- Expo
- Expo Router (file-based navigation)
- Firebase (Authentication & Firestore)
- NativeWind (Tailwind CSS for React Native)
- react-native-calendars
- expo-print & expo-sharing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - (Optional) Enable Google for Google Sign-In
3. Create a Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
4. Get your Firebase configuration:
   - Go to Project Settings
   - Under "Your apps", click the web icon (</>)
   - Copy your configuration values

### 3. Environment Variables

1. Copy example.env into .env and delete example.env
  
   ```
2. Fill in your Firebase configuration values in `.env`

### 4. Firestore Security Rules

Add these security rules in Firebase Console > Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Run the App

Start the Expo development server:

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Project Structure

```
sharksheets/
├── app/
│   ├── (auth)/
│   │   └── login.tsx          # Login screen
│   ├── (app)/
│   │   ├── home.tsx           # Landing/home screen
│   │   ├── calendar.tsx       # Monthly calendar view
│   │   └── day-entry.tsx      # Day entry form
│   ├── _layout.tsx            # Root layout with AuthProvider
│   ├── index.tsx              # Entry point with auth routing
│   └── globals.css            # Global Tailwind styles
├── components/                 # Reusable components
├── context/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   ├── firebase.ts            # Firebase configuration
│   └── types.ts               # TypeScript interfaces
└── tailwind.config.js         # Tailwind configuration
```

## Color Theme

The app uses a beautiful purple color scheme:

- **Primary Purple**: Various shades from #faf5ff to #3b0764
- **Accent Colors**:
  - Pink: #ec4899
  - Blue: #3b82f6
  - Teal: #14b8a6

## Data Model

### DayEntry
```typescript
{
  id: string
  date: string
  names: string[]
  location: string
  workHours: {
    start: string
    end: string
    total: number
  }
  userId: string
  createdAt: Date
  updatedAt: Date
}
```

## Features in Detail

### Authentication
- Email/password sign up and sign in
- Google Sign-In support (requires additional Expo configuration)
- Persistent authentication state
- Protected routes

### Calendar View
- Monthly calendar with marked days
- Tap on any day to add/edit entry
- View entry details directly on calendar screen
- Generate PDF for current month

### Day Entry Form
- Add multiple names for a day
- Specify location/work site
- Enter start and end times
- Automatic calculation of total hours
- Edit or delete existing entries

### PDF Export
- Generate professional PDF reports
- Includes all entries for selected month
- Formatted table with date, names, location, and hours
- Share or save PDF

## Next Steps / TODO

The app is functional but needs the following improvements:

### 🔧 Critical Fixes

1. **Google OAuth Redirect URI**
   - Currently Google Sign-In may fail due to redirect URI mismatch
   - Need to configure authorized redirect URIs in Google Cloud Console
   - Add `https://auth.expo.io/@your-username/sharksheets` to authorized URIs
   - Test OAuth flow on both iOS and Android devices

2. **Calendar Multiple Logs**
   - Current implementation only allows one entry per day
   - Need to support multiple entries/shifts per day
   - Update data model to store array of entries per date
   - Modify calendar view to show multiple entry indicators
   - Update day-entry screen to list and manage multiple entries

### 🎨 Styling & UI Polish

3. **Enhance Page Styling**
   - Login screen: Add gradient backgrounds and animations
   - Home screen: Improve card layouts and add icons
   - Calendar screen: Better visual indicators for days with entries
   - Day entry form: Add time picker components instead of text input
   - Add loading states and skeleton screens
   - Implement smooth transitions between screens
   - Ensure consistent spacing and typography throughout

4. **Additional Assets**
   - Create custom app icon (purple theme)
   - Design splash screen with SharkSheets branding
   - Add placeholder images/illustrations
   - Create empty state graphics for calendar and home screen
   - Design success/error state animations

### 📝 Detailed Task Breakdown

#### Google OAuth Fix
```
1. Go to Google Cloud Console
2. Navigate to APIs & Credentials
3. Click on OAuth 2.0 Client IDs
4. Add authorized redirect URIs
5. Test on Expo Go and standalone builds
```

#### Calendar Multi-Entry Support
```
1. Update Firestore structure: entries/{userId}_{date}_{entryId}
2. Modify calendar.tsx to fetch all entries for a date
3. Add entry list view in calendar screen
4. Update day-entry.tsx to create new entry IDs
5. Add "New Entry" button for same-day entries
```

#### Styling Checklist
- [ ] Add custom fonts (e.g., Inter, Poppins)
- [ ] Implement consistent shadow/elevation system
- [ ] Add micro-interactions (button press, swipe gestures)
- [ ] Create reusable component library
- [ ] Add dark mode support
- [ ] Ensure responsive design for tablets

## Future Enhancements

- Time picker component for easier time input
- Weekly view option
- Statistics and analytics
- Recurring entries
- Offline support
- Push notifications for reminders
- Export to Excel/CSV formats
- Team collaboration features

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
