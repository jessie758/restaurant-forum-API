const DEFAULT_LIMIT = 10;
const DEFAULT_TOTAL = 50;

const getOffset = (page = 1, limit = DEFAULT_LIMIT) => (page - 1) * limit;

const getPagination = (
  page = 1,
  limit = DEFAULT_LIMIT,
  total = DEFAULT_TOTAL
) => {
  const totalPage = Math.ceil(total / limit);
  const pageNumbers = Array.from(
    { length: totalPage },
    (_, index) => index + 1
  );
  const currentPage = Math.min(Math.max(page, 1), page);
  const prev = Math.max(currentPage - 1, 1);
  const next = Math.min(currentPage + 1, totalPage);

  return {
    totalPage,
    pageNumbers,
    currentPage,
    prev,
    next,
  };
};

module.exports = {
  getOffset,
  getPagination,
};
