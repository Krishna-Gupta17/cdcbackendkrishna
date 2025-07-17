import { User } from '../models/user.js'
import { Team } from '../models/team.js';
import { Member } from '../models/member.js';


export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
    console.log(users)
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

export const getAllMember = async (req, res) => {
  try {
    const member = await Member.find()
    console.log(member)
    res.status(200).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching members', error: err.message });
  }
};

export const getUserPofile = async (req, res) => {
  try {
    const userid = req.params.id;
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
}


export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, college, universityRollNo } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      college,
      universityRollNo,
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userID,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
    console.log(teams)
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching teams',
      error: err.message
    });
  }
};


export const getTeam = async (req, res) => {
  try {
    const teamid = req.body.id;
    const team = await Team.findById(teamid);

    res.status(200).json({
      success: true,
      team
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching team',
      error: err.message
    });
  }
}

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.teamID,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, team });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.teamID);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, message: 'Team deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { isRegistered } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.teamID,
      { 'event.isRegistered': isRegistered },
      { new: true }
    );
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, team });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addmember = async (req, res) => {
  try {
    const member = req.body;

    const foundone = await Member.findOne({
      email: member.email,
      memberName: member.memberName
    });

    if (foundone) {
      return res.status(400).json({
        success: false,
        message: 'Member already exists'
      });
    }

    const newmember = new Member({
      memberName: member.memberName,
      memberEmail: member.memberEmail,
      memberRole: member.memberRole,
      memberYear: member.memberYear,

    });

    await newmember.save();

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: newmember
    });

  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
