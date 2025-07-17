import { Feedback } from "../models/feedback.js";

export const sendFeedback = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;
        if (!firstName || !lastName || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // Create feedback object
        const feedback = await Feedback.create({
            firstName,
            lastName,
            email,
            phone,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
