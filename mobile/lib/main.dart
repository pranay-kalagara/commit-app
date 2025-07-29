import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'providers/auth_provider.dart';
import 'providers/goals_provider.dart';
import 'providers/checkins_provider.dart';
import 'services/api_service.dart';
import 'utils/app_router.dart';
import 'constants/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize secure storage
  const secureStorage = FlutterSecureStorage();
  
  // Initialize API service
  final apiService = ApiService();
  
  runApp(CommitApp(
    apiService: apiService,
    secureStorage: secureStorage,
  ));
}

class CommitApp extends StatelessWidget {
  final ApiService apiService;
  final FlutterSecureStorage secureStorage;

  const CommitApp({
    super.key,
    required this.apiService,
    required this.secureStorage,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(
            apiService: apiService,
            secureStorage: secureStorage,
          )..checkAuthStatus(),
        ),
        ChangeNotifierProvider(
          create: (_) => GoalsProvider(apiService: apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => CheckInsProvider(apiService: apiService),
        ),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return MaterialApp.router(
            title: 'Commit',
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,
            routerConfig: AppRouter.createRouter(authProvider),
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}
