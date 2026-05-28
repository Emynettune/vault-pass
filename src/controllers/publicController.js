// Public controller - no authentication required

exports.getMessage = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This route is public'
  });
};