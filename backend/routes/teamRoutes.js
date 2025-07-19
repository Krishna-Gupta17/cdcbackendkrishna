// routes/eventRegister.js
import express from 'express';
import mongoose from 'mongoose';
import { Team } from '../models/team.js';
import { User } from '../models/user.js';
import { auth } from '../configs/configs.js'; // Firebase Admin init

const router = express.Router();

router.post('/register', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token' });

  try {
    // Verify Firebase token
    const decoded = await auth.verifyIdToken(token);
    const firebaseUID = decoded.uid;

    const session = await mongoose.startSession();
    session.startTransaction();

    const { teamName, leader, teammate1, teammate2, payment } = req.body;
    console.log("teamName:", teamName);

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
const existingTeam = await Team.findOne({ name: teamName }).session(session);
if (existingTeam) {
  await session.abortTransaction();
  session.endSession();
  return res.status(400).json({ success: false, message: "Team name already taken" });
}

// 5. Create team using leaderUser._id and teammates' _ids
const team = await Team.create([{
  name:teamName,
  leaderId: leaderUser._id,
  members: teammateUsers.map(u => u._id),
  payment: {
    status: 'pending',
    lastUpdated: new Date(),
  }
}], { session });
console.log("team :",team);
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

export default router;
