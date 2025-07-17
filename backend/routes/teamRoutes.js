import {Router} from 'express';
import { protect } from '../middleware/firebaseauthmiddleware.js';
import { requireEventRole } from '../middleware/auth.js';
import{teamNameRegistration,getForm,addMember,teamInfo,updateMembers, teamDetails} from '../controllers/eventControls.js';

const router=Router();

router.get('/', (req, res) => {
  res.send('Team base route working');
});


//if role team leader, get form to make team
router.get("/register",protect,getForm);

//create team
router.post("/createTeam",protect,requireEventRole("Team Leader"),teamNameRegistration); 

//add member
router.post('/addMember', protect, requireEventRole('Team Leader'),addMember);

//update team data
router.put('/:teamId',protect,requireEventRole('Team Leader'), teamInfo);

//update member data
router.put('/members/:memberId',protect, requireEventRole('Team Leader'),updateMembers);

//get info for team dashboard
router.get('/:teamId', protect, teamDetails);

export default router;
