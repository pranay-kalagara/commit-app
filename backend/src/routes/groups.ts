import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// GET /groups - Get user's groups
router.get('/', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Groups listing not implemented yet',
            statusCode: 501,
        },
    });
});

// POST /groups - Create new group
router.post('/', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Group creation not implemented yet',
            statusCode: 501,
        },
    });
});

// GET /groups/:groupId - Get group details
router.get('/:groupId', (req: Request, res: Response) => {
    res.status(501).json({
        error: {
            message: 'Group details not implemented yet',
            statusCode: 501,
        },
    });
});

export default router;
