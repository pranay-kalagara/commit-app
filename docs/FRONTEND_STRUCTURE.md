# Commit App - Frontend Structure & Key User Flows

## App Structure (React Native + Expo)

```
src/
├── components/           # Reusable UI components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Avatar.tsx
│   ├── camera/
│   │   ├── CameraView.tsx
│   │   └── PhotoPreview.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   ├── StreakCounter.tsx
│   │   └── ProgressBar.tsx
│   └── social/
│       ├── CheckInCard.tsx
│       ├── CommentList.tsx
│       └── LikeButton.tsx
├── screens/             # Main app screens
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── goals/
│   │   ├── GoalsListScreen.tsx
│   │   ├── CreateGoalScreen.tsx
│   │   ├── GoalDetailScreen.tsx
│   │   └── CheckInScreen.tsx
│   ├── social/
│   │   ├── FeedScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── FriendsScreen.tsx
│   ├── groups/
│   │   ├── GroupsScreen.tsx
│   │   ├── GroupDetailScreen.tsx
│   │   └── CreateGroupScreen.tsx
│   └── replays/
│       ├── ReplaysScreen.tsx
│       └── ReplayViewScreen.tsx
├── navigation/          # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── TabNavigator.tsx
├── services/           # API calls and business logic
│   ├── api.ts
│   ├── auth.ts
│   ├── goals.ts
│   ├── social.ts
│   └── camera.ts
├── store/              # State management (Redux Toolkit)
│   ├── store.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── goalsSlice.ts
│   │   ├── socialSlice.ts
│   │   └── groupsSlice.ts
├── utils/              # Helper functions
│   ├── dateUtils.ts
│   ├── imageUtils.ts
│   └── constants.ts
└── types/              # TypeScript type definitions
    ├── User.ts
    ├── Goal.ts
    ├── CheckIn.ts
    └── Group.ts
```

## Key User Flows

### 1. Onboarding Flow
```
Welcome Screen → Sign Up → Profile Setup → Goal Categories → First Goal Creation → Camera Tutorial → First Check-in
```

### 2. Daily Check-in Flow
```
Home Screen → Active Goals → Select Goal → Camera → Take Photo → Add Caption → Post → Celebration Animation
```

### 3. Goal Creation Flow
```
Goals Tab → Create Goal → Choose Category → Set Details → Set Duration → Invite Friends → Create
```

### 4. Social Interaction Flow
```
Feed Tab → See Friend's Check-in → Like/Comment → View Profile → Follow/Message
```

### 5. Group Challenge Flow
```
Groups Tab → Join Group → View Challenge → Accept → Daily Check-ins → Group Leaderboard → Completion Celebration
```

## Core UI Components Design

### Color Palette
```typescript
export const colors = {
  primary: '#6C5CE7',      // Purple - main brand
  secondary: '#A29BFE',    // Light purple
  success: '#00B894',      // Green - streaks/success
  warning: '#FDCB6E',      // Yellow - warnings
  danger: '#E17055',       // Red - missed days
  background: '#F8F9FA',   // Light gray background
  surface: '#FFFFFF',      // White cards/surfaces
  text: {
    primary: '#2D3436',    // Dark gray
    secondary: '#636E72',  // Medium gray
    light: '#B2BEC3'       // Light gray
  }
};
```

### Typography Scale
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' }
};
```

## Screen Wireframes (Key Screens)

### Home Screen Layout
```
┌─────────────────────────────────┐
│ ☰  Commit        🔔  👤        │
├─────────────────────────────────┤
│                                 │
│ 📊 Your Progress Today          │
│ ┌─────────────────────────────┐ │
│ │ 💪 Gym Workout    Day 15/30 │ │
│ │ ████████████░░░░  50%      │ │
│ │ 📸 Check in now             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📚 Learn Spanish    Day 8/60   │
│ ┌─────────────────────────────┐ │
│ │ ██████░░░░░░░░░░  13%      │ │
│ │ ✅ Checked in today         │ │
│ └─────────────────────────────┘ │
│                                 │
│ 👥 Group Challenges             │
│ ┌─────────────────────────────┐ │
│ │ Team Fitness Challenge      │ │
│ │ 🥇 Sarah  🥈 You  🥉 Mike   │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🎬 Recent Replays               │
│ [Thumbnail] [Thumbnail] [More]  │
└─────────────────────────────────┘
```

### Check-in Screen Layout
```
┌─────────────────────────────────┐
│ ← 💪 Gym Workout - Day 15       │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │        CAMERA VIEW          │ │
│ │                             │ │
│ │                             │ │
│ │                             │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💬 Add a caption...             │
│ ┌─────────────────────────────┐ │
│ │ Crushed leg day! Feeling    │ │
│ │ stronger every day 💪       │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📍 Add location (optional)      │
│                                 │
│     [📸 Capture]  [✅ Post]     │
└─────────────────────────────────┘
```

### Feed Screen Layout
```
┌─────────────────────────────────┐
│ Feed              🔍           │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Sarah • 2h ago           │ │
│ │ 💪 Gym Workout - Day 12     │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │                         │ │ │
│ │ │      [Check-in Photo]   │ │ │
│ │ │                         │ │ │
│ │ └─────────────────────────┘ │ │
│ │ "New PR on deadlifts! 🔥"   │ │
│ │ ❤️ 12  💬 3  📤 Share      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Mike • 4h ago            │ │
│ │ 📚 Learn Python - Day 25    │ │
│ │ [Code screenshot]           │ │
│ │ "Built my first web app!"   │ │
│ │ ❤️ 8   💬 5  📤 Share      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Animation & Interaction Design

### Micro-interactions
1. **Check-in Success**: Confetti animation + streak counter increment
2. **Goal Completion**: Celebration modal with stats
3. **Streak Milestones**: Special badges and animations
4. **Photo Capture**: Smooth camera transition with flash effect
5. **Like Button**: Heart animation with bounce effect

### Transitions
1. **Screen Navigation**: Slide transitions between main screens
2. **Modal Presentations**: Slide up from bottom for forms
3. **Tab Switching**: Smooth fade transitions
4. **Image Loading**: Skeleton loading states

### Accessibility Features
1. **Voice Over**: Full screen reader support
2. **Dynamic Type**: Respect system font size settings
3. **High Contrast**: Support for accessibility color modes
4. **Haptic Feedback**: Tactile feedback for key actions

## Performance Considerations
1. **Image Optimization**: Compress photos before upload
2. **Lazy Loading**: Load feed content as user scrolls
3. **Caching**: Cache user data and images locally
4. **Offline Support**: Allow viewing cached content offline
5. **Background Sync**: Upload check-ins when connection restored
