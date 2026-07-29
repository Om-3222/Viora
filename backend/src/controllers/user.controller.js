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