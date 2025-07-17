import { Team } from '../models/team.js';
import { User } from '../models/user.js';
import { Blog } from '../models/blog.js';
// Get all members
export const getAllMember = async (req, res) => {
	try {
		const users = await User.find({ isActive: true })
			.select('-password -email')
			.sort({ username: 1 });
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: 'server error' });
	}
};


//get blogs status for members only
export const getBlogsStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { page = 1, limit = 10, status = 'published' } = req.query;

		let query = { author: id };

		// If member is requesting their own blogs, they can see unpublished ones
		if (req.user && req.user.id === id) {
			if (status === 'all') {
				// No additional filter
			} else if (status === 'draft') {
				query.isPublished = false;
			} else {
				query.isPublished = true;
			}
		} else {
			// Public access - only published blogs
			query.isPublished = true;
		}

		const blogs = await Blog.find(query)
			.populate('author', 'username firstName lastName profileImage')
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Blog.countDocuments(query);

		res.json({
			success: true,
			data: blogs,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Get user blogs error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
};

//deletes user data
export const deactivateUser = async (req, res) => {
	try {
		const firebaseUID = req.user.uid;
		const { id } = req.params;
		// Check if user is deleting their own account or is admin
		if (firebaseUID !== id && req.user.role !== 'admin') {

			return res.status(403).json({
				success: false,
				message: 'Not authorized to delete this account'
			});
		}
		const user = await User.findOne({ firebaseUID });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}
		// Soft delete - just deactivate
		user.isActive = false;
		user.updatedAt = new Date();

		await user.save();

		res.json({
			success: true,
			message: 'Account deactivated successfully'
		});

	} catch (error) {
		console.error('Delete user error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
};

// Team dashboard
export const teamDashboard = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user || !user.teamId) {
			return res.status(404).json({ message: 'User or team not found' });
		}
		const team = await Team.findById(user.teamId);
		if (!team) {
			return res.status(404).json({ message: 'Team not found' });
		}
		res.json({ success: true, data: team });
	} catch (error) {
		res.status(400).json({ message: 'Error loading dashboard' });
	}
};

// User dashboard
export const userDashboard = async (req, res) => {
	try {
		const firebaseUid = req.user.firebaseUid;
		const dashboard = await User.findOne({ firebaseUID: firebaseUid }).select('-password');
		if (!dashboard) {
			return res.status(404).json({ message: 'error getting user data' });
		}
		const { firstName, lastName, email, phone, college, rollno, teamname } = dashboard;
		res.json({
			success: true,
			user: {
				username: firstName + lastName,
				email,
				phone,
				college,
				rollno,
				teamname,
			}
		});
	} catch (error) {
		console.error('Error getting user data:', error);
		res.status(400).json({ message: 'error getting user data' });
	}
};

//user profile
export const userProfile = async (req, res) => {
	try {
		const firebaseUID = req.user.firebaseUid;

		const profile = await User.findOne({ firebaseUID }).select('-password');
		if (!profile) {
			return res.status(404).json({ message: 'error getting user data' });
		}
		const { firstName, lastName, email, phone, college, rollno, teamname ,role} = profile;
		res.json({
			success: true,
			user: {
				username: firstName + " " +lastName,
				email,
				phone,
				college,
				rollno,
				teamname,
				role
			}
		});
	} catch (error) {
		console.error('Error getting user data:', error);
		res.status(400).json({ message: 'error getting user data' });
	}
};


//update user profile details
export const updateProfile = async (req, res) => {
	try {
		const firebaseUid = req.user.firebaseUid;

		const user = await User.findOne({ firebaseUID: firebaseUid });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		const allowedUpdates = ['phone', 'college', 'rollno'];
		allowedUpdates.forEach(field => {
			if (req.body[field] !== undefined) {
				user[field] = req.body[field];
			}
		});

		user.updatedAt = new Date();
		await user.save();

		res.json({
			success: true,
			message: 'Profile updated successfully',
			data: user,
		});

	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
};
