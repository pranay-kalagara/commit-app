import 'package:flutter/material.dart';

class GoalDetailScreen extends StatelessWidget {
  final String goalId;

  const GoalDetailScreen({super.key, required this.goalId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Goal Details'),
      ),
      body: Center(
        child: Text('Goal Detail Screen - Goal ID: $goalId'),
      ),
    );
  }
}
