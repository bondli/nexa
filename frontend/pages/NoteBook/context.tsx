import React, { createContext, useState, useCallback } from 'react';
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
  getNoteList: (isLoadMore?: boolean) => Promise<void>;
  getNoteCounts: () => void;
  notesLoading: boolean;
  notesHasMore: boolean;
  notesTotal: number;
};

export const NoteContext = createContext<NoteContextType | undefined>(undefined);
export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCate, setCurrentCate] = useState(DEFAULT_CATE);
  const [cateList, setCateList] = useState([]);
  const [noteList, setNoteList] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteCounts, setNoteCounts] = useState({});
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesOffset, setNotesOffset] = useState(0);
  const [notesHasMore, setNotesHasMore] = useState(true);
  const [notesTotal, setNotesTotal] = useState(0);
  const NOTE_LIMIT = 20;

  // 获取分类列表
  const getCateList = async () => {
    const response = await request.get('/cate/list');
    setCateList(response.data || []);
  };

  // 获取笔记列表（支持分页）
  const getNoteList = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setNotesLoading(true);
        setNotesOffset(0);
      } else if (notesLoading) {
        return;
      }

      const currentOffset = isLoadMore ? notesOffset : 0;

      try {
        const response = await request.get(
          `/note/getList?cateId=${currentCate.id}&limit=${NOTE_LIMIT}&offset=${currentOffset}`,
        );
        // response 本身就是 { code, data, count } 因为拦截器返回了 response.data
        const newList = response.data || [];
        const total = response.count || 0;

        if (isLoadMore) {
          setNoteList((prev) => [...prev, ...newList]);
        } else {
          setNoteList(newList);
        }

        setNotesTotal(total);
        setNotesHasMore(currentOffset + newList.length < total);
        setNotesOffset(currentOffset + newList.length);
      } finally {
        setNotesLoading(false);
      }
    },
    [currentCate.id, notesOffset, notesLoading],
  );

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
        notesHasMore,
        notesTotal,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
