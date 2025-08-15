import express from 'express'
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { protect } from '../middleware/firebaseauthmiddleware.js'
import {
  getAllTeams,
  getAllUser,
  createUser,
  deleteUser,
  getUserPofile,
  getTeam,
  updateTeam,
  deleteTeam,
  addmember,
  getAllMember,
  deleteMember,
  updateUser
} from "../controllers/adminControl.js"
import { registerWithFirebase } from '../controllers/firebaseauthControl.js';

const router = express.Router();

//const sendPaymentAcceptedMail=(email,username)=>{}

//router.get('/profile',getAdminprofile); show admin(self) profile
//router.put('/profile',getAdminprofile); update admin(self) profile


router.get('/', (req, res) => {
  res.send('admin base route working');
});


router.get('/users', getAllUser);

router.get('/users/:userID', getUserPofile)

router.post('/users', protect, requireRole('admin'), createUser);

router.put('/users/:userID',protect, requireRole('admin'), updateUser);

router.delete('/users/:userID', authenticateUser, requireRole('admin'), deleteUser);

router.get('/teams', getAllTeams)

router.get('/teams/:teamID', getTeam);

router.put('/teams/:teamID', updateTeam);

router.delete('/teams/:teamID', authenticateUser, requireRole('admin'), deleteTeam);

//router.put('/teams/:teamID/payment', requireRole('admin'), updatePaymentStatus);

router.get('/members', getAllMember)

router.post('/members', addmember)

router.delete('/members/:memberID', authenticateUser, requireRole('admin'), deleteMember);

export default router;