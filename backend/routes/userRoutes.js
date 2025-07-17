import express from 'express';
import {
  deactivateUser,
  teamDashboard,
  userDashboard,
  userProfile,
  updateProfile
} from '../controllers/userControl.js'
import { sendFeedback }  from '../controllers/feedbackControl.js';
import { protect } from '../middleware/firebaseauthmiddleware.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('User base route working');
});

// Get user event dashboard
router.get('/dashboard', protect, userDashboard);

// Update user profile
router.put('/profile', protect, updateProfile);

//get user profile
router.get('/profile', protect, userProfile );

// Get  their current team data
router.get('/team/:id', teamDashboard);

//make changes in their team,
//router.put('/team/:id',updateteam)

//deactivate account
router.delete('/:uid', protect, deactivateUser)

// router.post('/profile',protect,logOut);

//feedback or contactus
router.post('/feedback', sendFeedback);

export default router;