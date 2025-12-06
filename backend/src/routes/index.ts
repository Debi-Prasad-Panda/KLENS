import express from 'express';
import multer from 'multer';
import { register, login, grantCinderellaAccess, checkCinderellaAccess } from '../controllers/auth.controller.js';
import { uploadDocument, getDocument, getDocuments, updateDocument, revertDocument } from '../controllers/document.controller.js';
import { createApproval, approveAction, getApprovals } from '../controllers/approval.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') }
});

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/cinderella', authenticate, authorize('admin'), grantCinderellaAccess);
router.get('/auth/cinderella', authenticate, checkCinderellaAccess);

// Document routes
router.post('/documents', authenticate, upload.single('file'), uploadDocument);
router.get('/documents', authenticate, getDocuments);
router.get('/documents/:id', authenticate, getDocument);
router.put('/documents/:id', authenticate, updateDocument);
router.post('/documents/:id/revert/:version', authenticate, authorize('admin'), revertDocument);

// Approval routes
router.post('/approvals', authenticate, authorize('admin'), createApproval);
router.post('/approvals/:id/approve', authenticate, authorize('admin'), approveAction);
router.get('/approvals', authenticate, authorize('admin'), getApprovals);

export default router;
