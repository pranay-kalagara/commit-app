# Commit App - Flutter Mobile

This is the Flutter mobile application for the Commit social accountability platform.

## Features

- **Authentication**: User registration, login, and profile management
- **Goals Management**: Create, track, and manage personal goals
- **Daily Check-ins**: Photo-based progress tracking with social sharing
- **Social Feed**: View and interact with public check-ins from other users
- **Progress Analytics**: Streak tracking and goal statistics

## Architecture

- **Frontend**: Flutter with Material Design 3
- **State Management**: Provider pattern
- **Navigation**: GoRouter for declarative routing
- **API Communication**: Dio HTTP client
- **Local Storage**: Flutter Secure Storage + Hive
- **Image Handling**: Image picker and cached network images

## Development Setup

### Prerequisites

- Flutter SDK 3.16.5+
- Docker and Docker Compose
- Android SDK (for Android development)
- Xcode (for iOS development, macOS only)

### Running with Docker

1. Build and start the containerized development environment:
```bash
docker-compose up mobile
```

2. The Flutter web app will be available at the auto-assigned port (check Docker logs)

3. For mobile development, use Flutter's hot reload:
```bash
flutter run
```

### Running Locally

1. Install dependencies:
```bash
flutter pub get
```

2. Run the app:
```bash
# Web
flutter run -d web-server --web-port 8080

# Android
flutter run -d android

# iOS
flutter run -d ios
```

## Project Structure

```
lib/
├── constants/          # App constants and configuration
├── models/            # Data models
├── providers/         # State management providers
├── screens/           # UI screens
│   ├── auth/         # Authentication screens
│   ├── home/         # Home dashboard
│   ├── goals/        # Goal management
│   ├── checkin/      # Check-in functionality
│   └── profile/      # User profile
├── services/         # API and external services
├── utils/            # Utilities and helpers
└── widgets/          # Reusable UI components
```

## API Integration

The app connects to the Node.js backend API running on `http://backend:3000` (in Docker) or `http://localhost:3000` (local development).

Key API endpoints:
- Authentication: `/auth/*`
- Goals: `/goals/*`
- Check-ins: `/check-ins/*`
- File uploads: `/upload/*`

## State Management

Uses the Provider pattern with the following providers:
- `AuthProvider`: User authentication and profile management
- `GoalsProvider`: Goal creation, updates, and statistics
- `CheckInsProvider`: Daily check-ins and social feed

## Theming

Implements Material Design 3 with custom color schemes:
- Primary: Indigo (#6366F1)
- Secondary: Emerald (#10B981)
- Accent: Amber (#F59E0B)

Supports both light and dark themes with automatic system detection.

## Development Notes

- The app is designed mobile-first but supports web deployment
- All API calls include proper error handling and loading states
- Images are cached for optimal performance
- Secure storage is used for authentication tokens
- The app follows Flutter best practices and conventions

## Migration from React Native

This Flutter app replaces the previous React Native/Expo implementation while maintaining the same backend API compatibility. Key improvements:

- Better performance with native compilation
- Improved development experience
- More consistent cross-platform behavior
- Better integration with native device features
- Simplified deployment and distribution
