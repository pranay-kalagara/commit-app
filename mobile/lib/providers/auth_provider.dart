import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService;
  final FlutterSecureStorage _secureStorage;

  AuthState _state = AuthState.initial;
  User? _user;
  String? _errorMessage;

  AuthProvider({
    required ApiService apiService,
    required FlutterSecureStorage secureStorage,
  })  : _apiService = apiService,
        _secureStorage = secureStorage;

  // Getters
  AuthState get state => _state;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _state == AuthState.authenticated && _user != null;
  bool get isLoading => _state == AuthState.loading;

  // Check authentication status on app start
  Future<void> checkAuthStatus() async {
    _setState(AuthState.loading);

    try {
      final accessToken = await _secureStorage.read(key: ApiConstants.accessTokenKey);
      
      if (accessToken != null) {
        _apiService.setAccessToken(accessToken);
        
        // Try to get current user to validate token
        final user = await _apiService.getCurrentUser();
        _user = user;
        _setState(AuthState.authenticated);
      } else {
        _setState(AuthState.unauthenticated);
      }
    } catch (e) {
      // Token might be expired or invalid
      await _clearStoredAuth();
      _setState(AuthState.unauthenticated);
    }
  }

  // Register new user
  Future<bool> register({
    required String email,
    required String username,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    _setState(AuthState.loading);

    try {
      final response = await _apiService.register(
        email: email,
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
      );

      final user = User.fromJson(response['user']);
      final token = response['token'];

      await _storeAuthData(user, token);
      _apiService.setAccessToken(token);
      _user = user;
      _setState(AuthState.authenticated);
      
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  // Login user
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setState(AuthState.loading);

    try {
      final response = await _apiService.login(
        email: email,
        password: password,
      );

      final user = User.fromJson(response['user']);
      final token = response['token'];

      await _storeAuthData(user, token);
      _apiService.setAccessToken(token);
      _user = user;
      _setState(AuthState.authenticated);
      
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  // Logout user
  Future<void> logout() async {
    _setState(AuthState.loading);

    try {
      await _apiService.logout();
    } catch (e) {
      // Even if logout fails on server, we still clear local data
      if (kDebugMode) {
        print('Logout error: $e');
      }
    }

    await _clearStoredAuth();
    _apiService.setAccessToken(null);
    _user = null;
    _setState(AuthState.unauthenticated);
  }

  // Update user profile
  Future<bool> updateProfile({
    String? firstName,
    String? lastName,
    String? profileImageUrl,
  }) async {
    if (_user == null) return false;

    try {
      final updates = <String, dynamic>{};
      if (firstName != null) updates['firstName'] = firstName;
      if (lastName != null) updates['lastName'] = lastName;
      if (profileImageUrl != null) updates['profileImageUrl'] = profileImageUrl;

      // Note: This would need to be implemented in the API service
      // For now, we'll update locally
      _user = _user!.copyWith(
        firstName: firstName ?? _user!.firstName,
        lastName: lastName ?? _user!.lastName,
        profileImageUrl: profileImageUrl ?? _user!.profileImageUrl,
      );

      // Store updated user data
      await _secureStorage.write(
        key: ApiConstants.userDataKey,
        value: jsonEncode(_user!.toJson()),
      );

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Private methods
  void _setState(AuthState newState) {
    _state = newState;
    _errorMessage = null;
    notifyListeners();
  }

  void _setError(String error) {
    _state = AuthState.error;
    _errorMessage = error;
    notifyListeners();
  }

  Future<void> _storeAuthData(User user, String token) async {
    await _secureStorage.write(key: ApiConstants.accessTokenKey, value: token);
    await _secureStorage.write(
      key: ApiConstants.userDataKey,
      value: jsonEncode(user.toJson()),
    );
  }

  Future<void> _clearStoredAuth() async {
    await _secureStorage.delete(key: ApiConstants.accessTokenKey);
    await _secureStorage.delete(key: ApiConstants.refreshTokenKey);
    await _secureStorage.delete(key: ApiConstants.userDataKey);
  }
}
