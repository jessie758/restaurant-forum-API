// 測試檔模擬的是 helpers 模組的行為，而非 ensureAuthenticated 函式本身
// 所以要引入的是整個模組，而非用解構賦值引入單個函式
// const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers');
const helpers = require('../helpers/auth-helpers');

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) return next();

  req.flash('error_messages', 'Please sign in.');
  return res.redirect('/signin');
};

const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) return next();

    req.flash('error_messages', 'Permission required.');
    return res.redirect('/restaurants');
  } else {
    req.flash('error_messages', 'Please sign in.');
    return res.redirect('/signin');
  }
};

module.exports = {
  authenticated,
  authenticatedAdmin,
};
