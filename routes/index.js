const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const admin = require('./modules/admin');
const restController = require('../controllers/restaurant-controller');
const commentController = require('../controllers/comment-controller');
const userController = require('../controllers/user-controller');
const authHandler = require('../middlewares/auth-handler');
const upload = require('../middlewares/multer');

router.use('/admin', authHandler.authenticatedAdmin, admin);

router.get(
  '/restaurants/top',
  authHandler.authenticated,
  restController.getTopRestaurants
);
router.get(
  '/restaurants/feeds',
  authHandler.authenticated,
  restController.getFeeds
);
router.get(
  '/restaurants/:id/dashboard',
  authHandler.authenticated,
  restController.getDashboard
);
router.get(
  '/restaurants/:id',
  authHandler.authenticated,
  restController.getRestaurant
);
router.get(
  '/restaurants',
  authHandler.authenticated,
  restController.getRestaurants
);

router.post(
  '/comments',
  authHandler.authenticated,
  commentController.postComment
);
router.delete(
  '/comments/:id',
  authHandler.authenticatedAdmin,
  commentController.deleteComment
);

router.post(
  '/favorites/:restaurantId',
  authHandler.authenticated,
  userController.addFavorite
);
router.delete(
  '/favorites/:restaurantId',
  authHandler.authenticated,
  userController.removeFavorite
);

router.post(
  '/like/:restaurantId',
  authHandler.authenticated,
  userController.addLike
);
router.delete(
  '/like/:restaurantId',
  authHandler.authenticated,
  userController.removeLike
);

router.post(
  '/following/:userId',
  authHandler.authenticated,
  userController.addFollowing
);
router.delete(
  '/following/:userId',
  authHandler.authenticated,
  userController.removeFollowing
);

router.get('/users/top', authHandler.authenticated, userController.getTopUsers);
router.get(
  '/users/:id/edit',
  authHandler.authenticated,
  userController.editUser
);
router.get('/users/:id', authHandler.authenticated, userController.getUser);
router.put(
  '/users/:id',
  authHandler.authenticated,
  upload.single('image'),
  userController.putUser
);

router.get('/signup', userController.signUpPage);
router.get('/signin', userController.signInPage);
router.get('/logout', userController.logout);
router.post('/signup', userController.signUp);
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true,
  }),
  userController.signIn
);

router.use('/', (req, res) => res.redirect('/restaurants'));

module.exports = router;
