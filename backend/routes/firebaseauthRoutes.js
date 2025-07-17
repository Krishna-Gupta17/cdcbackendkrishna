import express from 'express';
import { protect } from '../middleware/firebaseauthmiddleware.js';
import {
  registerWithFirebase,
  loginWithFirebase,
  getProfile,
} from '../controllers/firebaseauthControl.js'

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Firebase auth base route working');
});

router.post('/register', registerWithFirebase);

router.post('/login', loginWithFirebase)

router.get('/profile', protect, getProfile);

const firebaseAuthRouter = router;
export default firebaseAuthRouter;
