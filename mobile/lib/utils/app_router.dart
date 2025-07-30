import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../screens/auth/welcome_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/main/main_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/goals/goals_screen.dart';
import '../screens/goals/create_goal_screen.dart';
import '../screens/goals/goal_detail_screen.dart';
import '../screens/checkin/checkin_screen.dart';
import '../screens/checkin/create_checkin_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/edit_profile_screen.dart';

class AppRouter {
  static GoRouter createRouter(AuthProvider authProvider) {
    return GoRouter(
      initialLocation: '/',
      redirect: (context, state) {
        final isAuthenticated = authProvider.isAuthenticated;
        final isAuthRoute = state.fullPath?.startsWith('/auth') ?? false;
        final authState = authProvider.state;
        
        if (kDebugMode) {
          print('🗺 Router redirect check:');
          print('  - Current path: ${state.fullPath}');
          print('  - Auth state: $authState');
          print('  - Is authenticated: $isAuthenticated');
          print('  - Is auth route: $isAuthRoute');
          print('  - User: ${authProvider.user?.firstName}');
        }

        // If not authenticated and not on auth route, redirect to welcome
        if (!isAuthenticated && !isAuthRoute) {
          if (kDebugMode) {
            print('  - Redirecting to /auth/welcome (not authenticated)');
          }
          return '/auth/welcome';
        }

        // If authenticated and on auth route, redirect to home
        if (isAuthenticated && isAuthRoute) {
          if (kDebugMode) {
            print('  - Redirecting to / (authenticated on auth route)');
          }
          return '/';
        }

        if (kDebugMode) {
          print('  - No redirect needed');
        }
        return null; // No redirect needed
      },
      routes: [
        // Auth routes
        GoRoute(
          path: '/auth/welcome',
          name: 'welcome',
          builder: (context, state) => const WelcomeScreen(),
        ),
        GoRoute(
          path: '/auth/login',
          name: 'login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/auth/register',
          name: 'register',
          builder: (context, state) => const RegisterScreen(),
        ),

        // Main app routes with shell navigation
        ShellRoute(
          builder: (context, state, child) => MainScreen(child: child),
          routes: [
            // Home tab
            GoRoute(
              path: '/',
              name: 'home',
              builder: (context, state) => const HomeScreen(),
            ),

            // Goals tab
            GoRoute(
              path: '/goals',
              name: 'goals',
              builder: (context, state) => const GoalsScreen(),
              routes: [
                GoRoute(
                  path: 'create',
                  name: 'create-goal',
                  builder: (context, state) => const CreateGoalScreen(),
                ),
                GoRoute(
                  path: ':goalId',
                  name: 'goal-detail',
                  builder: (context, state) {
                    final goalId = state.pathParameters['goalId']!;
                    return GoalDetailScreen(goalId: goalId);
                  },
                ),
              ],
            ),

            // Check-in tab
            GoRoute(
              path: '/checkin',
              name: 'checkin',
              builder: (context, state) => const CheckInScreen(),
              routes: [
                GoRoute(
                  path: 'create',
                  name: 'create-checkin',
                  builder: (context, state) {
                    final goalId = state.uri.queryParameters['goalId'];
                    return CreateCheckInScreen(goalId: goalId);
                  },
                ),
              ],
            ),

            // Profile tab
            GoRoute(
              path: '/profile',
              name: 'profile',
              builder: (context, state) => const ProfileScreen(),
              routes: [
                GoRoute(
                  path: 'edit',
                  name: 'edit-profile',
                  builder: (context, state) => const EditProfileScreen(),
                ),
              ],
            ),
          ],
        ),
      ],
      errorBuilder: (context, state) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
              ),
              const SizedBox(height: 16),
              Text(
                'Page not found',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                state.error.toString(),
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
