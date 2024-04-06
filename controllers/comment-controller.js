const { Comment, User, Restaurant } = require('../models');
const { getUser } = require('../helpers/auth-helpers');

const commentHandler = {
  postComment: async (req, res, next) => {
    const { text, restaurantId } = req.body;
    const userId = getUser(req).id;

    try {
      if (!text) throw new Error('Comment text is required.');

      const [restaurant, user] = await Promise.all([
        Restaurant.findByPk(restaurantId),
        User.findByPk(userId),
      ]);

      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);
      if (!user) throw new Error(`User doesn't exist.`);

      await Comment.create({ text, restaurantId, userId });

      req.flash('success_messages', 'Comment was successfully created.');
      return res.redirect(`/restaurants/${restaurantId}`);
    } catch (error) {
      return next(error);
    }
  },
  deleteComment: async (req, res, next) => {
    const id = req.params.id;

    try {
      const comment = await Comment.findByPk(id);

      if (!comment) throw new Error(`Comment doesn't exist.`);

      const deletedComment = await comment.destroy();

      req.flash('success_messages', 'Comment was successfully deleted.');
      return res.redirect(`/restaurants/${deletedComment.restaurantId}`);
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = commentHandler;
