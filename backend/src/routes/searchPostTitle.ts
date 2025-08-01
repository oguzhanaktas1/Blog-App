import { Router } from 'express';
import { searchPostsByTitle } from '../controllers/SearchController';

const router = Router();

router.get('/', searchPostsByTitle);

export default router;