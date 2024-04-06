'use strict';

const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // sequelize 會將查詢結果物件存進陣列
    const categoryIds = await queryInterface.sequelize.query(
      'SELECT id FROM Categories',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert(
      'Restaurants',
      Array.from({ length: 50 }, () => ({
        name: faker.name.findName(),
        tel: faker.phone.phoneNumber(),
        opening_hours: '11:00',
        address: faker.address.streetAddress(),
        image: `https://loremflickr.com/320/240/restaurant,food/?random=${
          Math.random() * 100
        }`,
        description: faker.lorem.text(),
        category_id:
          categoryIds[Math.floor(Math.random() * categoryIds.length)].id,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Restaurants', {});
  },
};
