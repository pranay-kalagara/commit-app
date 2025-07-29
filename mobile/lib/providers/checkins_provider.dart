import 'dart:io';
import 'package:flutter/foundation.dart';

import '../models/checkin.dart';
import '../services/api_service.dart';

enum CheckInsState {
  initial,
  loading,
  loaded,
  error,
}

class CheckInsProvider extends ChangeNotifier {
  final ApiService _apiService;

  CheckInsState _state = CheckInsState.initial;
  List<CheckIn> _checkIns = [];
  List<CheckIn> _publicCheckIns = [];
  String? _errorMessage;
  bool _isCreating = false;
  bool _isUploading = false;

  CheckInsProvider({required ApiService apiService}) : _apiService = apiService;

  // Getters
  CheckInsState get state => _state;
  List<CheckIn> get checkIns => _checkIns;
  List<CheckIn> get publicCheckIns => _publicCheckIns;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == CheckInsState.loading;
  bool get isCreating => _isCreating;
  bool get isUploading => _isUploading;

  // Load user's check-ins
  Future<void> loadCheckIns() async {
    _setState(CheckInsState.loading);

    try {
      final checkIns = await _apiService.getCheckIns();
      _checkIns = checkIns;
      _setState(CheckInsState.loaded);
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Load public check-ins feed
  Future<void> loadPublicCheckIns({String? category}) async {
    try {
      final publicCheckIns = await _apiService.getPublicCheckIns(category: category);
      _publicCheckIns = publicCheckIns;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Create new check-in
  Future<bool> createCheckIn({
    required String goalId,
    required String description,
    required File imageFile,
    File? videoFile,
  }) async {
    _isCreating = true;
    notifyListeners();

    try {
      // Upload image first
      _isUploading = true;
      notifyListeners();
      
      final imageUrl = await _apiService.uploadImage(imageFile);
      
      String? videoUrl;
      if (videoFile != null) {
        // Note: Video upload would need to be implemented in API service
        // For now, we'll skip video upload
      }

      _isUploading = false;
      notifyListeners();

      // Create check-in with uploaded image URL
      final newCheckIn = await _apiService.createCheckIn(
        goalId: goalId,
        description: description,
        imageUrl: imageUrl,
        videoUrl: videoUrl,
      );

      _checkIns.insert(0, newCheckIn);
      _isCreating = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isCreating = false;
      _isUploading = false;
      _setError(e.toString());
      return false;
    }
  }

  // Get check-ins for a specific goal
  List<CheckIn> getCheckInsForGoal(String goalId) {
    return _checkIns.where((checkIn) => checkIn.goalId == goalId).toList();
  }

  // Get today's check-ins
  List<CheckIn> get todaysCheckIns {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);
    final todayEnd = todayStart.add(const Duration(days: 1));

    return _checkIns.where((checkIn) {
      return checkIn.createdAt.isAfter(todayStart) && 
             checkIn.createdAt.isBefore(todayEnd);
    }).toList();
  }

  // Get this week's check-ins
  List<CheckIn> get thisWeeksCheckIns {
    final now = DateTime.now();
    final weekStart = now.subtract(Duration(days: now.weekday - 1));
    final weekStartDay = DateTime(weekStart.year, weekStart.month, weekStart.day);

    return _checkIns.where((checkIn) {
      return checkIn.createdAt.isAfter(weekStartDay);
    }).toList();
  }

  // Get check-in statistics
  Map<String, int> get checkInStats {
    final today = todaysCheckIns.length;
    final thisWeek = thisWeeksCheckIns.length;
    final total = _checkIns.length;
    
    return {
      'today': today,
      'thisWeek': thisWeek,
      'total': total,
    };
  }

  // Check if user has checked in today for a specific goal
  bool hasCheckedInTodayForGoal(String goalId) {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);
    final todayEnd = todayStart.add(const Duration(days: 1));

    return _checkIns.any((checkIn) =>
        checkIn.goalId == goalId &&
        checkIn.createdAt.isAfter(todayStart) &&
        checkIn.createdAt.isBefore(todayEnd));
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Refresh check-ins
  Future<void> refresh() async {
    await loadCheckIns();
  }

  // Refresh public feed
  Future<void> refreshPublicFeed({String? category}) async {
    await loadPublicCheckIns(category: category);
  }

  // Private methods
  void _setState(CheckInsState newState) {
    _state = newState;
    _errorMessage = null;
    notifyListeners();
  }

  void _setError(String error) {
    _state = CheckInsState.error;
    _errorMessage = error;
    notifyListeners();
  }
}
