const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const currentYear = () => dayjs().year();

const relativeTimeFromNow = (time) => dayjs(time).fromNow();

const isEqual = (a, b) => a === b;

const isRootUser = (email) => email === 'root@example.com';

module.exports = {
  currentYear,
  relativeTimeFromNow,
  isEqual,
  isRootUser,
};
