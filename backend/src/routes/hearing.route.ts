import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js';
import requireCaseAccess from '../middlewares/caseAccess.middleware.js';
import { createHearingController, getAllHearingsController, updateHearingController } from '../controllers/hearing.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { createHearingSchema, updateHearingSchema } from '../validators/hearing.validator.js';

const hearingRouter = express.Router();

hearingRouter.post('/:caseId/hearings', authMiddleware, requireCaseAccess('UPDATE_CASE'), validate(createHearingSchema), createHearingController)
hearingRouter.get('/:caseId/hearings', authMiddleware, requireCaseAccess('READ_CASE'), getAllHearingsController)
hearingRouter.patch('/:caseId/hearings/:hearingId',authMiddleware, requireCaseAccess('UPDATE_CASE'), validate(updateHearingSchema),updateHearingController)

export default hearingRouter;