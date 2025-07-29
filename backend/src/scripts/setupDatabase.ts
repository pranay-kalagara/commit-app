import { query } from '../config/database';
import { logger } from '../utils/logger';

export async function setupDatabase(): Promise<void> {
    try {
        logger.info('Setting up database...');

        // Create goal categories table and insert default categories
        await query(`
            CREATE TABLE IF NOT EXISTS goal_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                icon VARCHAR(50),
                color VARCHAR(7),
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Insert default categories if they don't exist
        const existingCategories = await query('SELECT COUNT(*) FROM goal_categories');
        if (parseInt(existingCategories.rows[0].count) === 0) {
            await query(`
                INSERT INTO goal_categories (name, icon, color, description) VALUES
                ('Fitness', '💪', '#FF6B6B', 'Physical health and exercise goals'),
                ('Learning', '📚', '#4ECDC4', 'Education and skill development'),
                ('Creative', '🎨', '#45B7D1', 'Art, music, writing, and creative pursuits'),
                ('Health', '🏥', '#96CEB4', 'Mental health, nutrition, and wellness'),
                ('Career', '💼', '#FFEAA7', 'Professional development and work goals'),
                ('Habits', '⚡', '#DDA0DD', 'Daily habits and routine building'),
                ('Social', '👥', '#98D8C8', 'Relationships and social connections'),
                ('Other', '🎯', '#A8A8A8', 'Miscellaneous personal goals')
            `);
            logger.info('✅ Default goal categories created');
        }

        // Create users table
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                profile_image_url TEXT,
                bio TEXT,
                timezone VARCHAR(50) DEFAULT 'UTC',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                push_notifications_enabled BOOLEAN DEFAULT true
            )
        `);

        logger.info('✅ Database setup completed successfully');
    } catch (error) {
        logger.error('❌ Database setup failed:', error);
        throw error;
    }
}
