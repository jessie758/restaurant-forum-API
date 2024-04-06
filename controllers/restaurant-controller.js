const { Restaurant, Category, Comment, User } = require('../models');
const { getOffset, getPagination } = require('../helpers/pagination-helper');
const { getUser } = require('../helpers/auth-helpers');

const restController = {
  getRestaurants: async (req, res, next) => {
    const DEFAULT_LIMIT = 9;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || DEFAULT_LIMIT;
    const offset = getOffset(page, limit);
    const categoryId = Number(req.query.categoryId) || '';

    try {
      const [restaurantData, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          include: [Category],
          where: {
            ...(categoryId ? { categoryId } : {}),
          },
          limit,
          offset,
          nest: true,
          raw: true,
        }),
        Category.findAll({ raw: true }),
      ]);

      const favoritedRestaurantIds = getUser(req)?.FavoritedRestaurants?.map(
        (fr) => fr.id
      );

      const likedRestaurantIds = getUser(req)?.LikedRestaurants?.map(
        (lr) => lr.id
      );

      const restaurants = restaurantData.rows.map((restaurant) => ({
        ...restaurant,
        description: restaurant.description.substring(0, 50),
        isFavorited: favoritedRestaurantIds?.includes(restaurant.id),
        isLiked: likedRestaurantIds?.includes(restaurant.id),
      }));

      return res.render('restaurants', {
        restaurants,
        categories,
        categoryId,
        pagination: getPagination(page, limit, restaurantData.count),
      });
    } catch (error) {
      return next(error);
    }
  },
  getRestaurant: async (req, res, next) => {
    const id = req.params.id;

    try {
      const restaurant = await Restaurant.findByPk(id, {
        include: [Category, { model: Comment, include: [User] }],
        nest: true,
      });

      if (!restaurant) throw new Error(`Restaurant doesn't exist!`);

      await restaurant.increment({ view_counts: 1 });

      const isFavorited = getUser(req)?.FavoritedRestaurants?.some(
        (fr) => fr.id === restaurant.id
      );

      const isLiked = getUser(req)?.LikedRestaurants?.some(
        (lr) => lr.id === restaurant.id
      );

      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked,
      });
    } catch (error) {
      return next(error);
    }
  },
  getTopRestaurants: async (req, res, next) => {
    try {
      const restaurantData = await Restaurant.findAll({
        include: [{ model: User, as: 'FavoritedUsers' }],
      });

      const restaurants = restaurantData
        .map((restaurant) => ({
          ...restaurant.toJSON(),
          description: restaurant.description.substring(0, 50),
          favoritedCount: restaurant.FavoritedUsers?.length || 0,
          isFavorited: getUser(req)?.FavoritedRestaurants?.some(
            (fr) => fr.id === restaurant.id
          ),
        }))
        .sort(
          (restaurantA, restaurantB) =>
            restaurantB.favoritedCount - restaurantA.favoritedCount
        )
        .slice(0, 10);

      return res.render('top-restaurants', { restaurants });
    } catch (error) {
      return next(error);
    }
  },
  getDashboard: async (req, res, next) => {
    const id = req.params.id;

    try {
      const restaurant = await Restaurant.findByPk(id, {
        include: [Category, Comment],
        nest: true,
      });

      if (!restaurant) throw new Error(`Restaurant doesn't exist!`);

      return res.render('dashboard', { restaurant: restaurant.toJSON() });
    } catch (error) {
      return next(error);
    }
  },
  getFeeds: async (req, res, next) => {
    try {
      let [restaurants, comments] = await Promise.all([
        Restaurant.findAll({
          include: [Category],
          order: [['created_at', 'DESC']],
          limit: 10,
          nest: true,
          raw: true,
        }),
        Comment.findAll({
          include: [Restaurant, User],
          order: [['created_at', 'DESC']],
          limit: 10,
          nest: true,
          raw: true,
        }),
      ]);

      restaurants = restaurants.map((rest) => ({
        ...rest,
        description: `${rest.description.substring(0, 200)}${
          rest.description.length > 200 ? '...' : ''
        }`,
      }));

      comments = comments.map((comment) => ({
        ...comment,
        text: `${comment.text.substring(0, 150)}${
          comment.text.length > 150 ? '...' : ''
        }`,
      }));

      return res.render('feeds', { restaurants, comments });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = restController;
