class Goal {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String categoryId;
  final String categoryName;
  final String categoryIcon;
  final bool isPublic;
  final String? targetValue;
  final String? unit;
  final int currentStreak;
  final int longestStreak;
  final int totalCheckIns;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastCheckInDate;

  Goal({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.categoryId,
    required this.categoryName,
    required this.categoryIcon,
    required this.isPublic,
    this.targetValue,
    this.unit,
    required this.currentStreak,
    required this.longestStreak,
    required this.totalCheckIns,
    required this.createdAt,
    required this.updatedAt,
    this.lastCheckInDate,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    return Goal(
      id: json['id'],
      userId: json['userId'],
      title: json['title'],
      description: json['description'],
      categoryId: json['categoryId'],
      categoryName: json['categoryName'] ?? json['category_name'] ?? '',
      categoryIcon: json['categoryIcon'] ?? json['category_icon'] ?? '🎯',
      isPublic: json['isPublic'] ?? json['is_public'] ?? false,
      targetValue: json['targetValue'] ?? json['target_value'],
      unit: json['unit'],
      currentStreak: json['currentStreak'] ?? json['current_streak'] ?? 0,
      longestStreak: json['longestStreak'] ?? json['longest_streak'] ?? 0,
      totalCheckIns: json['totalCheckIns'] ?? json['total_check_ins'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at']),
      updatedAt: DateTime.parse(json['updatedAt'] ?? json['updated_at']),
      lastCheckInDate: json['lastCheckInDate'] != null || json['last_check_in_date'] != null
          ? DateTime.parse(json['lastCheckInDate'] ?? json['last_check_in_date'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'description': description,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'categoryIcon': categoryIcon,
      'isPublic': isPublic,
      'targetValue': targetValue,
      'unit': unit,
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'totalCheckIns': totalCheckIns,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'lastCheckInDate': lastCheckInDate?.toIso8601String(),
    };
  }

  Goal copyWith({
    String? id,
    String? userId,
    String? title,
    String? description,
    String? categoryId,
    String? categoryName,
    String? categoryIcon,
    bool? isPublic,
    String? targetValue,
    String? unit,
    int? currentStreak,
    int? longestStreak,
    int? totalCheckIns,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastCheckInDate,
  }) {
    return Goal(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      categoryIcon: categoryIcon ?? this.categoryIcon,
      isPublic: isPublic ?? this.isPublic,
      targetValue: targetValue ?? this.targetValue,
      unit: unit ?? this.unit,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      totalCheckIns: totalCheckIns ?? this.totalCheckIns,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastCheckInDate: lastCheckInDate ?? this.lastCheckInDate,
    );
  }

  bool get hasCheckedInToday {
    if (lastCheckInDate == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final lastCheckIn = DateTime(
      lastCheckInDate!.year,
      lastCheckInDate!.month,
      lastCheckInDate!.day,
    );
    return today.isAtSameMomentAs(lastCheckIn);
  }

  String get progressText {
    if (targetValue != null && unit != null) {
      return '$totalCheckIns / $targetValue $unit';
    }
    return '$totalCheckIns check-ins';
  }
}
