import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find(
            {
                _id: { $ne: req.user._id },
            },
            "-password"
        ).sort({ name: 1 });

        res.status(200).json(users);
    } catch (error) {
        console.error("Get Users Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        // Check if the new email is already in use by another user
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};