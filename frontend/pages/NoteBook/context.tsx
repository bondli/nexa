import React, { createContext, useState } from 'react';
import request from '@commons/request';
import { DEFAULT_CATE, Cate, Note } from './constant';

type NoteContextType = {
  currentCate: Cate;
  setCurrentCate: React.Dispatch<React.SetStateAction<Cate>>;
  cateList: Cate[];
  setCateList: React.Dispatch<React.SetStateAction<Cate[]>>;
  noteList: Note[];
  setNoteList: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNote: any;
  setSelectedNote: React.Dispatch<React.SetStateAction<any>>;
  noteCounts: { [key: string]: number };
  getCateList: () => void;
  getNoteList: () => void;
  getNoteCounts: () => void;
  notesLoading: boolean;
};

export const NoteContext = createContext<NoteContextType | undefined>(undefined);
export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCate, setCurrentCate] = useState(DEFAULT_CATE);
  const [cateList, setCateList] = useState([]);
  const [noteList, setNoteList] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteCounts, setNoteCounts] = useState({});
  const [notesLoading, setNotesLoading] = useState(true);

  // 获取分类列表
  const getCateList = async () => {
    const response = await request.get('/cate/list');
    setCateList(response.data || []);
  };

  // 获取笔记列表
  const getNoteList = async () => {
    setNotesLoading(true);
    const response = await request.get(`/note/getList?cateId=${currentCate.id}`);
    setNoteList(response.data || []);
    setNotesLoading(false);
  };

  // 获取各种分类下笔记的数量
  const getNoteCounts = async () => {
    const response = await request.get(`/note/counts`);
    setNoteCounts(response.data || {});
  };

  return (
    <NoteContext.Provider
      value={{
        currentCate,
        setCurrentCate,
        cateList,
        setCateList,
        getCateList,
        noteList,
        setNoteList,
        getNoteList,
        selectedNote,
        setSelectedNote,
        noteCounts,
        getNoteCounts,
        notesLoading,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
