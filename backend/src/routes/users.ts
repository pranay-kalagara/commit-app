import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// GET /users/me - Get current user profile (handled in auth routes)
// PUT /users/me - Update current user profile
router.put('/me', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'User profile update not implemented yet',
            statusCode: 501,
        },
    });
});

// POST /users/me/avatar - Upload profile picture
router.post('/me/avatar', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Avatar upload not implemented yet',
            statusCode: 501,
        },
    });
});

// GET /users/:userId - Get public user profile
router.get('/:userId', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Public user profile not implemented yet',
            statusCode: 501,
        },
    });
});

// GET /users/search - Search for users
router.get('/search', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'User search not implemented yet',
            statusCode: 501,
        },
    });
});

export default router;
