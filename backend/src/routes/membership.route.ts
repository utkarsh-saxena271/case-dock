import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js';
import { createJoinRequestController, deleteMemberController, getJoinRequestsController, getMembersController, reviewJoinRequestController, updateMemberController } from '../controllers/membership.controller.js';
import permissionMiddleware from '../middlewares/permission.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { reviewJoinRequestSchema, updateMemberSchema } from '../validators/membership.validation.js';
import { requireMemberMiddleware } from '../middlewares/requireMember.middleware.js';

const membershipRouter = express.Router();

membershipRouter.post('/:chamberId/join-requests', authMiddleware, createJoinRequestController)
membershipRouter.get('/:chamberId/join-requests', authMiddleware, permissionMiddleware('INVITE_MEMBERS'), getJoinRequestsController)
membershipRouter.patch('/:chamberId/join-requests/:membershipId', authMiddleware, permissionMiddleware('INVITE_MEMBERS'), validate(reviewJoinRequestSchema), reviewJoinRequestController)

membershipRouter.get('/:chamberId/members',authMiddleware, requireMemberMiddleware, getMembersController)
membershipRouter.patch('/:chamberId/members/:membershipId', authMiddleware, permissionMiddleware('EDIT_GROUP'), validate(updateMemberSchema), updateMemberController)
membershipRouter.delete('/:chamberId/members/:membershipId', authMiddleware, permissionMiddleware('REMOVE_MEMBERS'), deleteMemberController)

export default membershipRouter;