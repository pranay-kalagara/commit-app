class ApiConstants {
  // Base URL for the backend API
  // For web development, use localhost since browser runs outside Docker
  static const String baseUrl = 'http://localhost:3000';
  
  // For mobile development inside Docker, use:
  // static const String baseUrl = 'http://backend:3000';
  
  // API endpoints
  static const String authRegister = '/api/v1/auth/register';
  static const String authLogin = '/api/v1/auth/login';
  static const String authLogout = '/api/v1/auth/logout';
  static const String authMe = '/api/v1/auth/me';
  static const String authRefresh = '/api/v1/auth/refresh';
  
  static const String goals = '/api/v1/goals';
  static const String goalsCategories = '/api/v1/goals/categories';
  static const String goalsPublic = '/api/v1/goals/public';
  
  static const String checkIns = '/api/v1/check-ins';
  static const String checkInsPublic = '/api/v1/check-ins/public';
  
  static const String uploadImage = '/api/v1/upload/image';
  static const String uploadVideo = '/api/v1/upload/video';
  
  static const String users = '/api/v1/users';
  static const String usersMe = '/api/v1/users/me';
  
  // Request timeouts
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);
  
  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
}
