app.get('/dashboard/:role', (req, res) => {
  const { role } = req.params;
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render(`dashboard/${role}`, { user: req.user });
});