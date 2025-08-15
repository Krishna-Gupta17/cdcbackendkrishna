import { User } from '../models/user.js'
import { Team } from '../models/team.js';
import { Member } from '../models/member.js';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';


export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

export const getAllMember = async (req, res) => {
  try {
    const member = await Member.find()
    res.status(200).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching members', error: err.message });
  }
};

export const getUserPofile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userID).select('-password');
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
    await User.findByIdAndDelete(req.params.userID);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
}

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    	console.log(userRecord)
    const newUser = new User({
      firstName,
      lastName,
      email,
      firebaseUID: userRecord.uid, 
      role: 'user'
    });

    console.log(newUser)
    await newUser.save();
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      firebaseUser: userRecord,
      mongoUser: newUser
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error creating user',
      error: err.message
    });
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
    const team = await Team.findById(req.params.teamID);
    res.status(200).json({
      success: true,
      team
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching team',
      error: error.message
    });
  }
}

export const updateTeam = async (req, res) => {
  try {
    const flattenObject = (obj, parent = "", resObj = {}) => {
      for (let key in obj) {
        const propName = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          flattenObject(obj[key], propName, resObj);
        } else {
          resObj[propName] = obj[key];
        }
      }
      return resObj;
    };
    
    console.log(req.body)
    const updateData = flattenObject(req.body);
    console.log(updateData)
    const team = await Team.findByIdAndUpdate(
      req.params.teamID,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    console.log(team)
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }
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

export const deleteMember = async (req, res) => {
  try {
    const { memberID } = req.params;
    const member = await Member.findByIdAndDelete(memberID);


    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};