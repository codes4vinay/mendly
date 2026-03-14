export const getCentreBookings = async (req, res) => {
  try {
    let centreId = req.user?.serviceCentre;
    if (!centreId) {
      centreId = req.query.centreId;
    }
    if (!centreId) {
      return res.status(400).json({ message: "Service centre ID required" });
    }
    const bookings = await Booking.find({ serviceCentre: centreId })
      .populate("user", "name email")
      .populate("service")
      .populate("serviceCentre");

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
