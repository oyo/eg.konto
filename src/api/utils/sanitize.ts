import { defaultPageInfo, type PageInfo } from '@shared/types/data.js'

// TODO
// limit pageSize in prod
export const sanitizePageInfo = (info?: PageInfo): PageInfo =>
  info
    ? {
        page: info.page >= 0 ? info.page : defaultPageInfo.page,
        pageSize:
          info.pageSize > 0 && info.pageSize <= 10000 ? info.pageSize : defaultPageInfo.pageSize,
      }
    : defaultPageInfo
