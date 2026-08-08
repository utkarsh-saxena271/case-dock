import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createChamberSchema, updateChamberSchema } from '../validators/chamber.validator.js';
import { createChamberController, deleteChamberController, discoverChambersController, getChamberByIdController, getChamberCasesController, getMyChambersController, updateChamberController } from '../controllers/chamber.controller.js';
import permissionMiddleware from '../middlewares/permission.middleware.js';
import { requireOwnerMiddleware } from '../middlewares/requireOwner.middleware.js';
import { requireMemberMiddleware } from '../middlewares/requireMember.middleware.js';

const chamberRouter = express.Router();

chamberRouter.post('/', authMiddleware, validate(createChamberSchema), createChamberController)
chamberRouter.get('/', authMiddleware, getMyChambersController)
chamberRouter.get('/discover', authMiddleware, discoverChambersController)
chamberRouter.get('/:chamberId/cases', authMiddleware, permissionMiddleware('READ_CASE'), getChamberCasesController)
chamberRouter.get('/:chamberId', authMiddleware, requireMemberMiddleware, getChamberByIdController)
chamberRouter.patch('/:chamberId', authMiddleware, permissionMiddleware('EDIT_GROUP'), validate(updateChamberSchema), updateChamberController)
chamberRouter.delete('/:chamberId', authMiddleware, requireOwnerMiddleware, deleteChamberController)

export default chamberRouter;