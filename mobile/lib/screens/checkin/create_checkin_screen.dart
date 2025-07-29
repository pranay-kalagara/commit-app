import 'package:flutter/material.dart';

class CreateCheckInScreen extends StatelessWidget {
  final String? goalId;

  const CreateCheckInScreen({super.key, this.goalId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Check-in'),
      ),
      body: Center(
        child: Text('Create Check-in Screen - Goal ID: ${goalId ?? 'None'}'),
      ),
    );
  }
}
