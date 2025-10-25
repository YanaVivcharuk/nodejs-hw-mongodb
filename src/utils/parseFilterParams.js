export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const filter = {};

  if (query.type) {
    filter.contactType = query.type.trim();
  }

  if (typeof query.isFavourite !== 'undefined') {
    if (query.isFavourite === 'true') {
      filter.isFavourite = isFavourite === 'true';
    } else if (query.isFavourite === 'false') {
      filter.isFavourite = false;
    }
  }

  return filter;
};
