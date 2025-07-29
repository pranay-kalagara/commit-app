export interface Goal {
    id: string;
    user_id: string;
    category_id: number;
    title: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    target_frequency: number;
    is_public: boolean;
    status: 'active' | 'completed' | 'paused' | 'failed';
    created_at: Date;
    updated_at: Date;
    total_days: number;
    days_elapsed?: number;
    current_streak: number;
    longest_streak: number;
}

export interface GoalCategory {
    id: number;
    name: string;
    icon: string;
    color: string;
    description?: string;
    created_at: Date;
}

export interface CreateGoalRequest {
    title: string;
    description?: string;
    categoryId: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    targetFrequency?: number;
    isPublic?: boolean;
}

export interface UpdateGoalRequest {
    title?: string;
    description?: string;
    categoryId?: number;
    endDate?: string;
    targetFrequency?: number;
    isPublic?: boolean;
    status?: 'active' | 'completed' | 'paused' | 'failed';
}

export interface GoalWithCategory extends Goal {
    category: GoalCategory;
}

export interface GoalStats {
    goalId: string;
    totalDays: number;
    daysElapsed: number;
    checkInsCount: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    weeklyStats: Array<{
        week: number;
        checkIns: number;
        target: number;
    }>;
    monthlyProgress: Array<{
        month: string;
        checkIns: number;
        target: number;
    }>;
}
