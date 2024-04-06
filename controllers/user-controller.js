const { localFileHandler } = require('../helpers/file-helpers');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { User, Comment, Restaurant, Favorite, Like, Followship } = db;
const { getUser } = require('../helpers/auth-helpers');

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup');
  },
  signUp: async (req, res, next) => {
    const { name, email, password, passwordCheck } = req.body;

    try {
      if (password !== passwordCheck)
        throw new Error('Passwords do not match.');
    } catch (error) {
      return next(error);
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (user) throw new Error('Email already exists.');

      const hash = await bcrypt.hash(password, 10);
      await User.create({ name, email, password: hash });

      req.flash('success_messages', 'Successfully sign up.');
      return res.redirect('/signin');
    } catch (error) {
      next(error);
    }
  },
  signInPage: (req, res) => {
    return res.render('signin');
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'Successfully sign in.');
    return res.redirect('/restaurants');
  },
  logout: (req, res, next) => {
    req.flash('success_messages', 'Successfully log out.');
    req.logout((err) => {
      if (err) return next(err);
    });
    return res.redirect('/signin');
  },
  getUser: async (req, res, next) => {
    const id = req.params.id;

    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: User,
            as: 'Followings',
            attributes: ['id', 'image'],
          },
          {
            model: User,
            as: 'Followers',
            attributes: ['id', 'image'],
          },
          { model: Comment, include: [Restaurant] },
          {
            model: Restaurant,
            as: 'FavoritedRestaurants',
            attributes: ['id', 'image'],
          },
        ],
        nest: true,
      });

      if (!user) throw new Error(`User doesn't exist.`);

      const commentedRestaurantIdSet = new Set();
      user.Comments?.forEach((comment) =>
        commentedRestaurantIdSet.add(comment.restaurantId)
      );

      return res.render('users/profile', {
        user: user.toJSON(),
        commentedRestaurantNumber: commentedRestaurantIdSet.size,
      });
    } catch (error) {
      return next(error);
    }
  },
  getTopUsers: async (req, res, next) => {
    try {
      const usersData = await User.findAll({
        include: [{ model: User, as: 'Followers' }],
      });

      const users = usersData
        .map((user) => ({
          ...user.toJSON(),
          followerCount: user.Followers?.length || 0,
          isFollowed: getUser(req)?.Followings?.some((f) => f.id === user.id),
        }))
        .sort((userA, userB) => userB.followerCount - userA.followerCount);

      return res.render('top-users', { users });
    } catch (error) {
      return next(error);
    }
  },
  editUser: async (req, res, next) => {
    const id = req.params.id;

    try {
      const user = await User.findByPk(id);

      if (!user) throw new Error(`User doesn't exist.`);

      return res.render('users/edit', { user: user.toJSON() });
    } catch (error) {
      return next(error);
    }
  },
  putUser: async (req, res, next) => {
    const reqUserId = getUser(req).id;
    const userId = req.params.id;
    const { name } = req.body;
    const file = req.file;

    try {
      // 確認是使用者本人修改 Profile
      if (Number(reqUserId) !== Number(userId))
        throw new Error(`You don't have authority to edit this user's profile`);

      // 確認有輸入新的使用者名稱
      if (!name) throw new Error(`User name is required.`);
    } catch (error) {
      return next(error);
    }

    try {
      const [user, filePath] = await Promise.all([
        User.findByPk(userId),
        localFileHandler(file),
      ]);

      if (!user) throw new Error(`User doesn't exist.`);

      await user.update({
        name,
        image: filePath || null,
      });

      req.flash('success_messages', '使用者資料編輯成功');
      return res.redirect(`/users/${userId}`);
    } catch (error) {
      return next(error);
    }
  },
  addFavorite: async (req, res, next) => {
    const userId = getUser(req).id;
    const { restaurantId } = req.params;

    try {
      const [favorite, user, restaurant] = await Promise.all([
        Favorite.findOne({ where: { userId, restaurantId } }),
        User.findByPk(userId),
        Restaurant.findByPk(restaurantId),
      ]);

      if (favorite) throw new Error('You have favorited this restaurant.');
      // if (!user) throw new Error(`User doesn't exist.`);
      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);

      await Favorite.create({ userId, restaurantId });

      req.flash('success_messages', 'Successfully favorite the restaurant.');
      return res.redirect('back');
    } catch (error) {
      return next(error);
    }
  },
  removeFavorite: async (req, res, next) => {
    const userId = getUser(req).id;
    const { restaurantId } = req.params;

    try {
      const favorite = await Favorite.findOne({
        where: { userId, restaurantId },
      });

      if (!favorite) throw new Error(`You haven't favorited this restaurant.`);

      await favorite.destroy();

      req.flash('success_messages', 'Successfully unfavorite the restaurant.');
      return res.redirect('back');
    } catch (error) {
      return next(error);
    }
  },
  addLike: async (req, res, next) => {
    const userId = getUser(req).id;
    const restaurantId = req.params.restaurantId;

    try {
      const [like, user, restaurant] = await Promise.all([
        Like.findOne({ where: { userId, restaurantId } }),
        User.findByPk(userId),
        Restaurant.findByPk(restaurantId),
      ]);

      if (like) throw new Error('You have liked this restaurant.');
      // if (!user) throw new Error(`User doesn't exist.`);
      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);

      await Like.create({ userId, restaurantId });

      req.flash('success_messages', 'Successfully like the restaurant.');
      return res.redirect('back');
    } catch (error) {
      return next(error);
    }
  },
  removeLike: async (req, res, next) => {
    const userId = getUser(req).id;
    const { restaurantId } = req.params;

    try {
      const like = await Like.findOne({
        where: { userId, restaurantId },
      });

      if (!like) throw new Error(`You haven't liked this restaurant.`);

      await like.destroy();

      req.flash('success_messages', 'Successfully unlike the restaurant.');
      return res.redirect('back');
    } catch (error) {
      return next(error);
    }
  },
  addFollowing: async (req, res, next) => {
    const followerId = getUser(req).id;
    const { userId: followingId } = req.params;

    try {
      if (Number(followerId) === Number(followingId))
        throw new Error(`You can't follow yourself.`);
    } catch (error) {
      return next(error);
    }

    try {
      const [followship, follower, following] = await Promise.all([
        Followship.findOne({ where: { followerId, followingId } }),
        User.findByPk(followerId),
        User.findByPk(followingId),
      ]);

      if (followship) throw new Error('You have followed this user.');
      if (!follower) throw new Error(`Follower user doesn't exist.`);
      if (!following) throw new Error(`Following user doesn't exist.`);

      await Followship.create({ followerId, followingId });

      req.flash('success_messages', 'Successfully follow the user.');
      return res.redirect('back');
    } catch (error) {
      return next(error);
    }
  },
  removeFollowing: async (req, res, next) => {
    const followerId = getUser(req).id;
    const { userId: followingId } = req.params;

    try {
      const followship = await Followship.findOne({
        where: { followerId, followingId },
      });

      if (!followship) throw new Error(`You haven't followed this user.`);

      await followship.destroy();

      req.flash('success_messages', 'Successfully unfollow the user.');
      return res.redirect('back');
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = userController;
