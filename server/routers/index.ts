import express from 'express';
import { uploadImage, imageOcr } from '../controllers/common-controller';
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
  addNoteToKnowledge,
} from '../controllers/note-controller';
import {
  uploadDocs,
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

const router = express.Router();

// 初始化接口
router.get('/system/isInstalled', isInstalled);
router.post('/system/saveConfig', saveConfig);

// 通用接口
router.post('/common/uploadImage', uploadImage);
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
router.get('/note/addToKnowledge', addNoteToKnowledge);

// 文档相关
router.post('/docs/upload', uploadDocs);
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

export default router;
