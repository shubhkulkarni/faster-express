import { Router } from 'express';
import { UserController } from './controller';
import { validateUser } from './validation';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', validateUser, userController.create);
router.put('/:id', validateUser, userController.update);
router.delete('/:id', userController.delete);

export default router;