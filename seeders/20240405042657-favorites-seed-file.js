'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id FROM Users', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });

    const restaurants = await queryInterface.sequelize.query(
      'SELECT id FROM Restaurants LIMIT 10',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    // 前 10 筆餐廳資料索引
    const indexes = Array.from({ length: 10 }, (_, index) => index);
    const favorites = [];

    users.forEach((user) => {
      // 隨機取得其中 5 筆餐廳資料
      do {
        const random = Math.floor(Math.random() * 10);
        indexes.splice(0, 1);
      } while (indexes.length > 5);

      [...indexes].forEach((index) =>
        favorites.push({
          user_id: user.id,
          restaurant_id: restaurants[index].id,
          created_at: new Date(),
          updated_at: new Date(),
        })
      );
    });

    await queryInterface.bulkInsert('Favorites', favorites);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Favorites', {});
  },
};
