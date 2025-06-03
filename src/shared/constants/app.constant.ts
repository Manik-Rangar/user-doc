export declare const APP_PIPE = 'APP_PIPE';
export const APPLICATION_NAME = 'JKT Docs';
export const APPLICATION_DESCRIPTION = 'JKT Docs - Documents management system';
export const SORT_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
};
export const SORT_ORDER_LIST = (() => Object.keys(SORT_ORDER))();
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZE = 20;
export const PAGE = 1;
export const USER_MIN_PASSWORD_SIZE = 6;
export const USER_MIN_NAME_SIZE = 1;

export const LIST_PARAMS = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export const DOWNLOAD_PARAMS = {
  page: 1,
  limit: 2000,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};
