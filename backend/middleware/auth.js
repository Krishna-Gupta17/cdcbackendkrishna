import jwt from "jsonwebtoken";
import { Blog } from "../models/blog.js";
import { User } from "../models/user.js";
import { auth } from "../configs/configs.js"; 

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const dbUser = await User.findOne({ firebaseUID: decodedToken.uid }); 
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      ...decodedToken,
      role: dbUser.role
    };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const requireRole = (...roles) => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: `Access denied` });
		}
		next();
	};
};

export const requireEventRole = (...roles) => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.eventProfile.eventRole)) {
			return res.status(403).json({ message: `Access denied` });
		}
		next();
	}
}

// export const protect = (req, res, next) => {
//   const token = req.cookies.access_token;
//   if (!token) {
//     return res.sendStatus(403);
//   }
//   try {
//     const data = jwt.verify(token, process.env.JWT_SECRET); 
//     req.user = data; 
//     return next();
//   } catch {
//     return res.sendStatus(403);
//   } 
// };

/* used to input validation
export const validate = (rNot authorizedeq, res, next , error)=>{
	if(!error.isEmpty()){
		return res.status(400).json({errors:error.array()});
	}
	next();
};
*/

export const blogownership = async (req, res, next) => {
	try {
		const id = req.params(id)
		const blog = await Blog.findById(req.params.id);

		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}
		if (blog.author() !== req.user.id) {
			return res.status(403).json({ message: "not blog owner" });
		}
		return next();
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};
