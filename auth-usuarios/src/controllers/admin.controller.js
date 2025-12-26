export const adminDashboard = async (req, res) => {
  res.json({
    message: 'Bienvenido al panel de administrador',
    user: {
      id: req.user.id,
      email: req.user.email,
      roles: req.user.roles
    }
  });
};