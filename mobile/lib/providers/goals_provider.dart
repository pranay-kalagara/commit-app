import 'package:flutter/foundation.dart';

import '../models/goal.dart';
import '../services/api_service.dart';

enum GoalsState {
  initial,
  loading,
  loaded,
  error,
}

class GoalsProvider extends ChangeNotifier {
  final ApiService _apiService;

  GoalsState _state = GoalsState.initial;
  List<Goal> _goals = [];
  List<Goal> _publicGoals = [];
  List<Map<String, dynamic>> _categories = [];
  String? _errorMessage;
  bool _isCreating = false;
  bool _isUpdating = false;

  GoalsProvider({required ApiService apiService}) : _apiService = apiService;

  // Getters
  GoalsState get state => _state;
  List<Goal> get goals => _goals;
  List<Goal> get publicGoals => _publicGoals;
  List<Map<String, dynamic>> get categories => _categories;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == GoalsState.loading;
  bool get isCreating => _isCreating;
  bool get isUpdating => _isUpdating;

  // Load user's goals
  Future<void> loadGoals() async {
    _setState(GoalsState.loading);

    try {
      final goals = await _apiService.getGoals();
      _goals = goals;
      _setState(GoalsState.loaded);
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Load public goals
  Future<void> loadPublicGoals({String? category}) async {
    try {
      final publicGoals = await _apiService.getPublicGoals(category: category);
      _publicGoals = publicGoals;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Load goal categories
  Future<void> loadCategories() async {
    try {
      final categories = await _apiService.getGoalCategories();
      _categories = categories;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    }
  }

  // Create new goal
  Future<bool> createGoal({
    required String title,
    required String description,
    required String categoryId,
    required bool isPublic,
    String? targetValue,
    String? unit,
  }) async {
    _isCreating = true;
    notifyListeners();

    try {
      final newGoal = await _apiService.createGoal(
        title: title,
        description: description,
        categoryId: categoryId,
        isPublic: isPublic,
        targetValue: targetValue,
        unit: unit,
      );

      _goals.insert(0, newGoal);
      _isCreating = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isCreating = false;
      _setError(e.toString());
      return false;
    }
  }

  // Update goal
  Future<bool> updateGoal(String goalId, Map<String, dynamic> updates) async {
    _isUpdating = true;
    notifyListeners();

    try {
      final updatedGoal = await _apiService.updateGoal(goalId, updates);
      
      final index = _goals.indexWhere((goal) => goal.id == goalId);
      if (index != -1) {
        _goals[index] = updatedGoal;
      }

      _isUpdating = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isUpdating = false;
      _setError(e.toString());
      return false;
    }
  }

  // Delete goal
  Future<bool> deleteGoal(String goalId) async {
    try {
      await _apiService.deleteGoal(goalId);
      _goals.removeWhere((goal) => goal.id == goalId);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  // Get goal by ID
  Goal? getGoalById(String goalId) {
    try {
      return _goals.firstWhere((goal) => goal.id == goalId);
    } catch (e) {
      return null;
    }
  }

  // Get goals by category
  List<Goal> getGoalsByCategory(String categoryId) {
    return _goals.where((goal) => goal.categoryId == categoryId).toList();
  }

  // Get active goals (goals with recent check-ins)
  List<Goal> get activeGoals {
    return _goals.where((goal) => goal.currentStreak > 0).toList();
  }

  // Get goals that need check-ins today
  List<Goal> get goalsNeedingCheckIn {
    return _goals.where((goal) => !goal.hasCheckedInToday).toList();
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Refresh goals
  Future<void> refresh() async {
    await loadGoals();
  }

  // Private methods
  void _setState(GoalsState newState) {
    _state = newState;
    _errorMessage = null;
    notifyListeners();
  }

  void _setError(String error) {
    _state = GoalsState.error;
    _errorMessage = error;
    notifyListeners();
  }

  // Update goal locally after check-in
  void updateGoalAfterCheckIn(String goalId) {
    final index = _goals.indexWhere((goal) => goal.id == goalId);
    if (index != -1) {
      final goal = _goals[index];
      _goals[index] = goal.copyWith(
        totalCheckIns: goal.totalCheckIns + 1,
        currentStreak: goal.currentStreak + 1,
        lastCheckInDate: DateTime.now(),
      );
      notifyListeners();
    }
  }
}
