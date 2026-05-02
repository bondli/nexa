import config from '../../config.json';

export const DB_CONFIG = config;

export type TAB_KEY = 'Note' | 'Article' | 'Picture' | 'Collect' | 'Profile';

export const PAGE_MAP: Record<TAB_KEY, Record<string, string>> = {
  'Note': {
    title: '笔记',
    icon: 'file-text',
  },
  'Article': {
    title: '文章',
    icon: 'inbox',
  },
  'Collect': {
    title: '记录',
    icon: 'cloud-upload',
  },
  'Picture': {
    title: '图片',
    icon: 'picture',
  },
  'Profile': {
    title: '我的',
    icon: 'setting',
  },
};