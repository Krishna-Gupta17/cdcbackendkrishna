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
    addMember,
    getAllMember,
    deleteMember,
    updateUser,
    updateMember,
    getMember
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

router.put('/teams/:teamId', updateTeam);

router.delete('/teams/:teamID', authenticateUser, requireRole('admin'), deleteTeam);

//router.put('/teams/:teamID/payment', requireRole('admin'), updatePaymentStatus);

router.get('/members', getAllMember)

router.get('/members/:memberId',protect,requireRole('admin'), getMember)

router.post('/members', authenticateUser, requireRole('admin'), addMember)

router.delete('/members/:memberID', authenticateUser, requireRole('admin'), deleteMember);

router.put('/members/:memberID',protect,requireRole('admin'), updateMember);

export default router;