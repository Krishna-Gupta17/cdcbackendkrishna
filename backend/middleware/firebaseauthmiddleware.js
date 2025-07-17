import { Blog } from "../models/blog.js";
import { auth } from "../configs/configs.js"; // Firebase Admin SDK setup
import { User } from "../models/user.js";

// Middleware to protect routes with Firebase token
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decodedToken = await auth.verifyIdToken(token);

    const user = await User.findOne({ firebaseUID: decodedToken.uid });

    if (!user) {
      return res.status(401).json({ message: "User not found in database" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      eventProfile: user.eventProfile || {},
      firebaseUid: decodedToken.uid,
      role:user.role
    };
    next();

  } catch (error) {
    console.error('Protect Middleware Error:', error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
