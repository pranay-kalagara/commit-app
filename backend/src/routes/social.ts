import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// GET /social/feed - Get social feed
router.get('/feed', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Social feed not implemented yet',
            statusCode: 501,
        },
    });
});

// GET /social/followers - Get followers
router.get('/followers', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Followers listing not implemented yet',
            statusCode: 501,
        },
    });
});

// GET /social/following - Get following
router.get('/following', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Following listing not implemented yet',
            statusCode: 501,
        },
    });
});

// POST /social/follow - Follow user
router.post('/follow', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'User following not implemented yet',
            statusCode: 501,
        },
    });
});

export default router;
