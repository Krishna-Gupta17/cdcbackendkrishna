import { User } from '../models/user.js';
import { auth } from '../configs/configs.js';
import { Member } from '../models/member.js';

export const registerWithFirebase = async (req, res) => {
  const { firebaseToken, phone, firstName, lastName, college, rollno } = req.body;
  console.log("Received registration data:", req.body);
  if (!firebaseToken) return res.status(400).json({ message: "Token required" });

  try {
    const decoded = await auth.verifyIdToken(firebaseToken);
    const { email, uid } = decoded;

    let user = await User.findOne({ email });
    const memberEmail = email;
    let member = await Member.findOne({ memberEmail })
    const role = (member) ? "member" : "user";
    if (!user) {
      user = await User.create({
        firebaseUID: uid,
        email,
        firstName,
        lastName,
        phone,
        college,
        rollno,
        username: `${firstName} ${lastName}`,
        isActive: true,
        role
      });
    }
    else {
      return res.status(500).json({ message: "User alredy exists", success: false, user });
    }

    return res.status(201).json({ message: "User registred", success: true, user });

  } catch (error) {
    console.error("User creation failed:", error);
    return res.status(500).json({ success: false, message: "User creation failed", error: error.message });
  }

};

export const loginWithFirebase = async (req, res) => {
  const { firebaseToken } = req.body;
  if (!firebaseToken) return res.status(400).json({ message: "Token required" });

  try {
    const decoded = await auth.verifyIdToken(firebaseToken);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// For testing protected routes
export const getProfile = async (req, res) => {
  try {
    // req.user will be attached by middleware after token verification
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'User profile fetched',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};