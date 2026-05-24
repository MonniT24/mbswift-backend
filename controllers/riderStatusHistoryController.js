const RiderStatusHistory = require("../models/RiderStatusHistory");

const getAllRiderStatusHistories = async (req, res) => {
  try {
    const histories = await RiderStatusHistory.find()
      .populate("rider", "name email phone role accountStatus status averageRating")
      .populate("admin", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(histories);
  } catch (error) {
    console.error("Get rider status histories error:", error);

    res.status(500).json({
      message: "Server error while getting rider status histories"
    });
  }
};

module.exports = {
  getAllRiderStatusHistories
};