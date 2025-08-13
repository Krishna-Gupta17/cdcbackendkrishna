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
    deleteMember
} from "../controllers/adminControl.js"

const router = express.Router();

//const sendPaymentAcceptedMail=(email,username)=>{}

//router.get('/profile',getAdminprofile); show admin(self) profile
//router.put('/profile',getAdminprofile); update admin(self) profile


router.get('/', (req, res) => {
  res.send('admin base route working');
});


router.get('/users', getAllUser);

router.post('/users',protect, requireRole('admin'), createUser);

router.put('/users/:userID', requireRole('admin'),getUserPofile);

router.delete('/users/:userID', authenticateUser, requireRole('admin'),deleteUser);

router.get('/teams',getAllTeams)

router.get('teams/:teamID', requireRole('admin'), getTeam);

router.put('/teams/:teamID',  requireRole('admin'),updateTeam);

router.delete('/teams/:teamID', authenticateUser, requireRole('admin'),deleteTeam);

//router.put('/teams/:teamID/payment', requireRole('admin'), updatePaymentStatus);

router.get('/members', getAllMember)

router.post('/members', authenticateUser, requireRole('admin'), addMember)

router.delete('/members/:memberID', authenticateUser, requireRole('admin'), deleteMember);

export default router;