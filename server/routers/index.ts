import express from 'express';
import { imageOcr, uploadFile } from '../controllers/common-controller';
import { addToKnowledge } from '../controllers/docs-associate-controller';
import { isInstalled, saveConfig } from '../controllers/install-controller';
import { createUser, userLogin, updateUser } from '../controllers/user-controller';
import { createCate, getCateInfo, getCates, updateCate, deleteCate } from '../controllers/cate-controller';
import {
  createCate as createPictureCate,
  getCateInfo as getPictureCateInfo,
  getCates as getPictureCates,
  updateCate as updatePictureCate,
  deleteCate as deletePictureCate,
} from '../controllers/picture-cate-controller';
import {
  createPicture,
  getPictureInfo,
  getPictures,
  updatePicture,
  deletePicture,
  getTrashPictures,
  restorePicture,
  forceDeletePicture,
  searchPictures,
  getPictureCounts,
} from '../controllers/picture-controller';
import {
  createNote,
  getNoteInfo,
  getNotes,
  updateNote,
  removeNote,
  moveNote,
  getNoteCounts,
  searchNotes,
} from '../controllers/note-controller';
import {
  createDocs,
  getDocsInfo,
  getDocsList,
  updateDocs,
  removeDocs,
  downloadDocs,
} from '../controllers/docs-controller';
import {
  getKnowledges,
  getKnowledgeById,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from '../controllers/knowledge-controller';
import {
  createChat,
  getChatInfo,
  getChats,
  updateChat,
  deleteChat,
  getMessages,
  chatToLLM,
} from '../controllers/chat-controller';
import {
  getChatCateList,
  addChatCate,
  updateChatCate,
  deleteChatCate,
  getChatCateChats,
  moveChatToCate,
  deleteChatCateChat,
  renameChatCateChat,
} from '../controllers/chat-cate-controller';
import {
  createArticle,
  getArticleInfo,
  getArticles,
  updateArticle,
  deleteArticle,
  recoverArticle,
  removeArticle,
  searchArticles,
  getArticleCounts,
} from '../controllers/article-controller';

import {
  createArticleCate,
  getArticleCates,
  updateArticleCate,
  deleteArticleCate,
} from '../controllers/article-cate-controller';

import {
  getTempArticles,
  deleteTempArticle,
  importTempArticle,
} from '../controllers/temp-article-controller';

import { getAllSettings, saveAllSettings } from '../controllers/settings-controller';

const router = express.Router();

// 初始化接口
router.get('/system/isInstalled', isInstalled);
router.post('/system/saveConfig', saveConfig);

// 通用接口
router.post('/common/uploadFile', uploadFile);
router.post('/common/ocr', imageOcr);

// 用户相关
router.post('/user/register', createUser);
router.post('/user/login', userLogin);
router.post('/user/update', updateUser);

// 笔记分类
router.post('/cate/create', createCate);
router.get('/cate/detail', getCateInfo);
router.get('/cate/list', getCates);
router.post('/cate/update', updateCate);
router.get('/cate/delete', deleteCate);

// 图片分类
router.post('/pictureCate/create', createPictureCate);
router.get('/pictureCate/detail', getPictureCateInfo);
router.get('/pictureCate/list', getPictureCates);
router.post('/pictureCate/update', updatePictureCate);
router.get('/pictureCate/delete', deletePictureCate);

// 笔记相关
router.post('/note/add', createNote);
router.get('/note/getList', getNotes);
router.post('/note/searchList', searchNotes);
router.get('/note/counts', getNoteCounts);
router.post('/note/update', updateNote);
router.get('/note/detail', getNoteInfo);
router.post('/note/move', moveNote);
router.get('/note/delete', removeNote);

// 文档相关
router.post('/docs/create', createDocs);
router.get('/docs/getList', getDocsList);
router.post('/docs/update', updateDocs);
router.get('/docs/info', getDocsInfo);
router.get('/docs/download', downloadDocs);
router.post('/docs/delete', removeDocs);

// 知识库相关
router.get('/knowledge/list', getKnowledges);
router.get('/knowledge/detail', getKnowledgeById);
router.post('/knowledge/create', createKnowledge);
router.post('/knowledge/update', updateKnowledge);
router.post('/knowledge/delete', deleteKnowledge);

// 图片相关
router.post('/picture/add', createPicture);
router.get('/picture/getList', getPictures);
router.get('/picture/getTrash', getTrashPictures);
router.get('/picture/getCounts', getPictureCounts);
router.get('/picture/search', searchPictures);
router.post('/picture/update', updatePicture);
router.get('/picture/delete', deletePicture);
router.get('/picture/restore', restorePicture);
router.get('/picture/forceDelete', forceDeletePicture);
router.get('/picture/detail', getPictureInfo);

// 会话相关
router.post('/chat/add', createChat);
router.get('/chat/detail', getChatInfo);
router.get('/chat/list', getChats);
router.post('/chat/update', updateChat);
router.post('/chat/delete', deleteChat);
router.get('/chat/msglist', getMessages);
router.post('/chat/withllm', chatToLLM);
router.post('/chat/move_to_cate', moveChatToCate);

// 聊天会话分组
router.get('/chat_cate/list', getChatCateList);
router.post('/chat_cate/add', addChatCate);
router.post('/chat_cate/update', updateChatCate);
router.get('/chat_cate/delete', deleteChatCate);
router.get('/chat_cate/chats', getChatCateChats);
router.post('/chat_cate/chat/delete', deleteChatCateChat);
router.post('/chat_cate/chat/rename', renameChatCateChat);

// 文章相关
router.post('/article/add', createArticle);
router.get('/article/getList', getArticles);
router.post('/article/searchList', searchArticles);
router.get('/article/counts', getArticleCounts);
router.post('/article/update', updateArticle);
router.get('/article/detail', getArticleInfo);
router.get('/article/delete', deleteArticle);
router.get('/article/recover', recoverArticle);
router.get('/article/remove', removeArticle);

// 文章分类
router.post('/article_cate/create', createArticleCate);
router.get('/article_cate/list', getArticleCates);
router.post('/article_cate/update', updateArticleCate);
router.get('/article_cate/delete', deleteArticleCate);

// 临时文章
router.get('/temp_article/list', getTempArticles);
router.get('/temp_article/delete', deleteTempArticle);
router.post('/temp_article/import', importTempArticle);

router.get('/knowledge/addToKnowledge', addToKnowledge);

// 设置相关
router.get('/settings/get', getAllSettings);
router.post('/settings/save', saveAllSettings);

export default router;
