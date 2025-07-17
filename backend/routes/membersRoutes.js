import express from 'express';
import { blogownership, requireRole } from '../middleware/auth.js';
import { protect } from '../middleware/firebaseauthmiddleware.js';

import {
  getMember,
  listMembers,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  updateMember
} from '../controllers/memberControl.js';
import { upload } from '../configs/configs.js';

const router = express.Router();

router.get('/', listMembers);
 
router.get('/:id', getMember); 

router.put('/:id', upload.single('memberImage'), updateMember);

// Get blog by user (public)
router.get('/blog/:id', getBlog);

// Create blog (protected)
router.post('/:id', upload.single('image'), createBlog);

// Update blog (protected, ownership)
router.put('/:id/:blogID', protect, blogownership, updateBlog);

// Delete blog (protected, ownership)
router.delete('/:id/:blogID', protect, blogownership, deleteBlog);

export default router;



