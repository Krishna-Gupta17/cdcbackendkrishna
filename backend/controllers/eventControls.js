import {Team} from '../models/team.js';
import {User} from '../models/user.js';

// Create a new team
export const teamNameRegistration = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the team name already exists
    const existingTeamByName = await Team.findOne({ name });
    if (existingTeamByName) {
      return res.status(400).json({ message: 'Team name already exists. Please choose a different name.' });
    }

    // Check if the leader already has a team
    const existingTeam = await Team.findOne({ leaderId: req.user.uid });
    if (existingTeam) {
      return res.status(400).json({ message: 'You have already created a team.' });
    }

    // Create a new team and add the leader to the members array
    const team = new Team({ name, leaderId: req.user.id, members: [req.user.id] });
    await team.save();

    // Update the leader's user data with the teamId
    await User.findByIdAndUpdate(req.user.uid, { teamId: team._id });

    res.status(201).json({ message: 'Team created successfully', teamId: team._id });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};

// Get team details for the logged-in user
export const getForm = async (req, res) => {
  try {
    // Find the team where the logged-in user is a member
    const team = await Team.findOne({ members: req.user.uid }).populate(
      'members',
      'name email phone universityRollNo codeforceHandle'
    );

    if (!team) {
      return res.status(404).json({ message: 'No team found for this user.' });
    }

    res.status(200).json({ team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};

// Add members to a team
export const addMember = async (req, res) => {

  try {
    const { teamId, members } = req.body;

    // Find the team and check if the user is the leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    console.log('Leader ID:', team.leaderId.toString());
    console.log('Logged-in User ID:', req.user.id.toString());

    if (!team.leaderId.equals(req.user.id)) {
      return res.status(403).json({ message: 'You are not authorized to update this team.' });
    }

    // Ensure the team doesn't exceed 3 members (excluding the leader)
    if (team.members.length + members.length > 3) {
      return res.status(400).json({ message: 'A team cannot have more than 3 members.' });
    }

    const leader = await User.findById(team.leaderId);
    if (!leader) {
      return res.status(404).json({ message: 'Team leader not found' });
    }

    for (const member of members) {
      // Check if the email corresponds to a registered user
      const user = await User.findOne({ email: member.email });
      if (!user) {
        return res.status(400).json({
          message: `User with email ${member.email} is not registered in the cdc website. please register the user before adding him as member.`
        });
      }

      // Check if the user is already part of a team
      if (user.teamId) {
        return res.status(400).json({
          message: `User with email ${member.email} is already part of another team.`
        });
      }

      // Add the user to the team if not already a member
      if (!team.members.includes(user._id)) {
        team.members.push(user._id);
        user.teamId = team._id;
        await user.save();
      }
    }

    await team.save();
    res.status(200).json({ message: 'Members added successfully', team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};

// Update team details (Team Leader can update the team name)
export const teamInfo = async (req, res) => {
  try {
    const { name } = req.body;
    const teamId = req.params.teamId;

    // Check if the team name already exists (exclude the current team)
    const existingTeam = await Team.findOne({ name, _id: { $ne: teamId } });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists. Please choose a different name.' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.leaderId.equals(req.user.id)) {
      return res.status(403).json({ message: 'You are not authorized to update this team.' });
    }

    team.name = name || team.name;
    await team.save();

    res.status(200).json({ message: 'Team updated successfully', team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};

// Update member details
export const updateMembers = async (req, res) => {
  try {
    const { name, email, phone, universityRollNo, codeforceHandle } = req.body;
    const memberId = req.params.memberId;

    const team = await Team.findOne({ leaderId: req.user.id });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (!team.members.includes(memberId)) {
      return res.status(403).json({ message: 'This user is not a member of your team' });
    }

    member.name = name || member.name;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.universityRollNo = universityRollNo || member.universityRollNo;
    member.codeforceHandle = codeforceHandle || member.codeforceHandle;

    await member.save();

    res.status(200).json({ message: 'Member details updated successfully', member });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};

// Fetch team details by teamId
export const teamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID format.' });
    }

    const team = await Team.findById(teamId).populate('members', 'name email phone universityRollNo codeforceHandle');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
};

