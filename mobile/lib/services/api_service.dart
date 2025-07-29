import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../models/goal.dart';
import '../models/checkin.dart';
import '../constants/api_constants.dart';

class ApiService {
  late final Dio _dio;
  String? _accessToken;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add interceptors for logging and token management
    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
      ));
    }

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_accessToken != null) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token expired, clear it
            _accessToken = null;
          }
          handler.next(error);
        },
      ),
    );
  }

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  // Authentication endpoints
  Future<Map<String, dynamic>> register({
    required String email,
    required String username,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await _dio.post(ApiConstants.authRegister, data: {
        'email': email,
        'username': username,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(ApiConstants.authLogin, data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.authLogout);
      _accessToken = null;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final response = await _dio.get(ApiConstants.authMe);
      return User.fromJson(response.data['user']);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Goals endpoints
  Future<List<Goal>> getGoals() async {
    try {
      final response = await _dio.get(ApiConstants.goals);
      return (response.data['goals'] as List)
          .map((json) => Goal.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Goal> createGoal({
    required String title,
    required String description,
    required String categoryId,
    required bool isPublic,
    String? targetValue,
    String? unit,
  }) async {
    try {
      final response = await _dio.post(ApiConstants.goals, data: {
        'title': title,
        'description': description,
        'categoryId': categoryId,
        'isPublic': isPublic,
        'targetValue': targetValue,
        'unit': unit,
      });
      return Goal.fromJson(response.data['goal']);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Goal> updateGoal(String goalId, Map<String, dynamic> updates) async {
    try {
      final response = await _dio.put('${ApiConstants.goals}/$goalId', data: updates);
      return Goal.fromJson(response.data['goal']);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> deleteGoal(String goalId) async {
    try {
      await _dio.delete('${ApiConstants.goals}/$goalId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Goal>> getPublicGoals({String? category}) async {
    try {
      final queryParams = category != null ? {'category': category} : <String, dynamic>{};
      final response = await _dio.get(ApiConstants.goalsPublic, queryParameters: queryParams);
      return (response.data['goals'] as List)
          .map((json) => Goal.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Check-ins endpoints
  Future<List<CheckIn>> getCheckIns() async {
    try {
      final response = await _dio.get(ApiConstants.checkIns);
      return (response.data['checkIns'] as List)
          .map((json) => CheckIn.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<CheckIn> createCheckIn({
    required String goalId,
    required String description,
    required String imageUrl,
    String? videoUrl,
  }) async {
    try {
      final response = await _dio.post(ApiConstants.checkIns, data: {
        'goalId': goalId,
        'description': description,
        'imageUrl': imageUrl,
        'videoUrl': videoUrl,
      });
      return CheckIn.fromJson(response.data['checkIn']);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<CheckIn>> getPublicCheckIns({String? category}) async {
    try {
      final queryParams = category != null ? {'category': category} : <String, dynamic>{};
      final response = await _dio.get(ApiConstants.checkInsPublic, queryParameters: queryParams);
      return (response.data['checkIns'] as List)
          .map((json) => CheckIn.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Goal categories
  Future<List<Map<String, dynamic>>> getGoalCategories() async {
    try {
      final response = await _dio.get(ApiConstants.goalsCategories);
      return List<Map<String, dynamic>>.from(response.data['categories']);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // File upload
  Future<String> uploadImage(File imageFile) async {
    try {
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split('/').last,
        ),
      });

      final response = await _dio.post('/upload/image', data: formData);
      return response.data['imageUrl'];
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      final data = error.response!.data;
      if (data is Map<String, dynamic> && data.containsKey('message')) {
        return data['message'];
      }
      return 'Server error: ${error.response!.statusCode}';
    } else if (error.type == DioExceptionType.connectionTimeout) {
      return 'Connection timeout';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      return 'Receive timeout';
    } else {
      return 'Network error: ${error.message}';
    }
  }
}
