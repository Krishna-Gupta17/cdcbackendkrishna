// controllers/teamController.js
import { Team } from "../models/team.js";
import { User } from "../models/user.js";

export const getTeamDetails = async (req, res) => {
  try {
    const  teamId  = req.user.teamId;

    // Find team and populate members + leader
    const team = await Team.findById(teamId)
      .populate("leaderId", "firstName lastName email phone college rollno eventProfile.codeforcesId")
      .populate("members", "firstName lastName email phone college rollno eventProfile.codeforcesId");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
