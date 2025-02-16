exports.routes = {
   category: 'main',
   path: '/login',
   method: 'get',
   execution: async (req, res) => {
      if (req.session.user) {
         return res.redirect('/home');
      }
      res.status(200).render("login");
   },
   error: false
}
