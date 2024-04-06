'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id FROM Users', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });

    const followships = [];

    users.forEach((_, i) => {
      for (let j = i + 1; j < users.length; j++) {
        followships.push({
          follower_id: users[i].id,
          following_id: users[j].id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });

    await queryInterface.bulkInsert('Followships', followships);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Followships', {});
  },
};
