export const DB_CONFIG = {
  host: 'sh-cdb-rpcxf0dm.sql.tencentcdb.com',
  port: 26884,
  username: 'root',
  password: 'cx0917CXC',
  // database: 'store_pos_backup_250930',
  database: 'chat_app',
};

export type TAB_KEY = 'Note' | 'Article' | 'Profile';

export const PAGE_MAP: Record<TAB_KEY, Record<string, string>> = {
  'Note': {
    title: '笔记',
    icon: 'file-text',
  },
  'Article': {
    title: '文章',
    icon: 'inbox',
  },
  'Profile': {
    title: '我的',
    icon: 'setting',
  },
};