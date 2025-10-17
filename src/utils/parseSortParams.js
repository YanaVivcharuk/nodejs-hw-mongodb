import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);
  if (isKnownOrder) return sortOrder;
  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  const keysOfStudent = [
    '_id',
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'createdAt',
    'updatedAt',
  ];

  if (keysOfStudent.includes(sortBy)) {
    return sortBy;
  }

  return '_id';
};

// export function parseSortOrder(value) {
//  if (typeof value === "udefined") {
//   return "asc";
//  } if ( value !== "asc" && value !== "desc") {
//   return "asc";
// }
// return value;
// }

export const parseSortParams = (query) => {
  const { sortOrder = SORT_ORDER.ASC, sortBy = 'name' } = query;
  console.log({ sortOrder, sortBy });

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
