// routes/eventRegister.js
import express from 'express';
import mongoose from 'mongoose';
import { Team } from '../models/team.js';
import { User } from '../models/user.js';
import { auth } from '../configs/configs.js'; // Firebase Admin init
import { getTeamDetails } from "../controllers/teamController.js";
import { protect } from '../middleware/firebaseauthmiddleware.js';
import { requireRole } from '../middleware/auth.js';
const router = express.Router();
//check
router.put("/member/update", protect, async (req, res) => {
  try {
    const { email, codeforcesId } = req.body;

    // Logged-in user (editor) from protect middleware
    const loggedInUserId = req.user.id;

    // Find the team of the logged-in user
    const team = await Team.findOne({ leaderId: loggedInUserId });
    if (!team) {
      return res.status(403).json({ message: "Only leader can edit the team" });
    }

    // Update member by email
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { "eventProfile.codeforcesId": codeforcesId },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




router.get("/user/team-status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.teamId) {
      return res.json({ hasTeam: true });
    } else {
      return res.json({ hasTeam: false });
    }
  } catch (err) {
    console.error("Error checking team status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/teamRoutes.js
router.get("/dashboard",protect, getTeamDetails);
//register routes
router.post('/register', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token' });

  try {
    // Verify Firebase token
    const decoded = await auth.verifyIdToken(token);
    const firebaseUID = decoded.uid;

    const session = await mongoose.startSession();
    session.startTransaction();

    const { name, leader, teammate1, teammate2, payment } = req.body;
    console.log("name:", name);

    // 1. Get firebaseUID from token


    // 2. Fetch leader directly from DB using firebaseUID
    const leaderUser = await User.findOne({ firebaseUID }, null, { session });
    if (!leaderUser) throw new Error("Leader not registered with Firebase UID");

    // 3. Update leader's eventProfile info
    leaderUser.eventProfile = {
      codeforcesId: leader.codeforces,
      eventRole: 'leader',
    };
    await leaderUser.save({ session });

    // 4. Process teammates
    const teammates = [teammate1, teammate2];
    const teammateUsers = [];

    for (let member of teammates) {
      const updated = await User.findOneAndUpdate(
        { email: member.email },
        {
          $set: {
            firstName: member.name.split(" ")[0],
            lastName: member.name.split(" ").slice(1).join(" ") || '',
            phone: member.phone,
            rollno: member.roll,
            eventProfile: {
              codeforcesId: member.codeforces,
              eventRole: 'teammember',
            }
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          session,
        }
      );

      teammateUsers.push(updated);
    }
    // Check if team name already exists
    const existingTeam = await Team.findOne({ name: name }).session(session);
    if (existingTeam) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Team name already taken" });
    }

    // 5. Create team using leaderUser._id and teammates' _ids
    const team = await Team.create([{
      name: name,
      leaderId: leaderUser._id,
      members: teammateUsers.map(u => u._id),
      payment: {
        status: 'pending',
        lastUpdated: new Date(),
      }
    }], { session });
    console.log("team :", team);
    // 6. Update all users with teamId
    const teamId = team[0]._id;

    await User.updateOne({ _id: leaderUser._id }, { teamId }, { session });
    await User.updateMany(
      { _id: { $in: teammateUsers.map(u => u._id) } },
      { teamId },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, teamId });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});


router.post('/register/admin',protect,requireRole('admin') ,async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { name, leader, teammate1, teammate2, payment } = req.body;

    const leaderUser = await User.findOne({ email: leader.email }, null, { session });
    if (!leaderUser) throw new Error("leader not found as user");

    const firebaseUID = leaderUser.firebaseUID;
    if (!firebaseUID) throw new Error("firebaseUID not found in user profile");

    leaderUser.eventProfile = {
      codeforcesId: leader.codeforces,
      eventRole: 'leader',
    };
    await leaderUser.save({ session });
    const teammates = [teammate1, teammate2];
    const teammateUsers = [];

    for (let member of teammates) {
      if (!member.email) continue;
      const updated = await User.findOneAndUpdate(
        { email: member.email },
        {
          $set: {
            firstName: member.name.split(" ")[0],
            lastName: member.name.split(" ").slice(1).join(" ") || '',
            eventProfile: {
              codeforcesId: member.codeforces,
              eventRole: 'teammember'
            },}},
        { upsert: true, new: true, setDefaultsOnInsert: true, session });
      teammateUsers.push(updated);}
    const existingTeam = await Team.findOne({ name: name }).session(session);
    if (existingTeam) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Team name already taken" });
    }
    const team = await Team.create([{
      name: name,
      leaderId: leaderUser._id,
      members: teammateUsers.map(u => u._id),
      payment: {
        status: payment || 'pending',
        lastUpdated: new Date(),
      }
    }], { session });
    const teamId = team[0]._id;
    await User.updateOne({ _id: leaderUser._id }, { teamId }, { session });
    await User.updateMany({ _id: { $in: teammateUsers.map(u => u._id) } }, { teamId }, { session });
    await session.commitTransaction();
    return res.status(201).json({ success: true, team });

  } catch (err) {
    console.error('Admin Registration Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
