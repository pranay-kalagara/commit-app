class CheckIn {
  final String id;
  final String userId;
  final String goalId;
  final String goalTitle;
  final String goalCategoryIcon;
  final String description;
  final String imageUrl;
  final String? videoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  CheckIn({
    required this.id,
    required this.userId,
    required this.goalId,
    required this.goalTitle,
    required this.goalCategoryIcon,
    required this.description,
    required this.imageUrl,
    this.videoUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CheckIn.fromJson(Map<String, dynamic> json) {
    return CheckIn(
      id: json['id'],
      userId: json['userId'] ?? json['user_id'],
      goalId: json['goalId'] ?? json['goal_id'],
      goalTitle: json['goalTitle'] ?? json['goal_title'] ?? '',
      goalCategoryIcon: json['goalCategoryIcon'] ?? json['goal_category_icon'] ?? '🎯',
      description: json['description'],
      imageUrl: json['imageUrl'] ?? json['image_url'],
      videoUrl: json['videoUrl'] ?? json['video_url'],
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at']),
      updatedAt: DateTime.parse(json['updatedAt'] ?? json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'goalId': goalId,
      'goalTitle': goalTitle,
      'goalCategoryIcon': goalCategoryIcon,
      'description': description,
      'imageUrl': imageUrl,
      'videoUrl': videoUrl,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  CheckIn copyWith({
    String? id,
    String? userId,
    String? goalId,
    String? goalTitle,
    String? goalCategoryIcon,
    String? description,
    String? imageUrl,
    String? videoUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CheckIn(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      goalId: goalId ?? this.goalId,
      goalTitle: goalTitle ?? this.goalTitle,
      goalCategoryIcon: goalCategoryIcon ?? this.goalCategoryIcon,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool get hasVideo => videoUrl != null && videoUrl!.isNotEmpty;

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
