import React, { memo, useContext, useRef, useState, useEffect } from 'react';
import {
  ProductOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  DeleteOutlined,
  FolderOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Popover, Input, App, Empty, Button } from 'antd';
import { userLog } from '@commons/electron';
import request from '@commons/request';
import { Cate } from './constant';
import { NoteContext } from './context';
import style from './index.module.less';

type MenuItemType = Required<MenuProps>['items'][number];

const MenuItem: React.FC<{ label: string; count: number }> = (props) => {
  const { label, count } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '30px',
      }}
    >
      <span>{label}</span>
      <span>{count}</span>
    </div>
  );
};

const Category: React.FC = () => {
  const { message } = App.useApp();
  const {
    currentCate,
    setCurrentCate,
    noteCounts = {},
    cateList,
    getCateList,
    getNoteCounts,
    getNoteList,
  } = useContext(NoteContext);

  // 笔记本分类菜单
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  // 创建笔记分类弹窗
  const [showNewModal, setShowNewModal] = useState(false);
  // 创建笔记分类名称
  const [newCateName, setNewCateName] = useState('');
  // 创建笔记分类输入框
  const inputRef = useRef(null);

  // 硬处理，预置的假分类
  const handCateList: Cate[] = [
    {
      id: 'all',
      name: '所有笔记',
      counts: noteCounts.all || 0,
      icon: <ProductOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
    {
      id: 'today',
      name: '今天到期',
      counts: noteCounts.today || 0,
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
    {
      id: 'done',
      name: '已完成',
      counts: noteCounts.done || 0,
      icon: <FileDoneOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
    {
      id: 'trash',
      name: '回收站',
      counts: noteCounts.deleted || 0,
      icon: <DeleteOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
  ];

  // 硬处理的分类
  const items: MenuItemType[] = [];
  handCateList.forEach((item) => {
    items.push({
      key: item.id,
      icon: item.icon,
      label: <MenuItem label={item.name} count={item.counts} />,
    });
  });

  // 选中一个硬编码的笔记分类
  const handleHandCateSelect = (e) => {
    const { key } = e;
    handCateList.forEach((item) => {
      if (item.id == key && item.id !== currentCate.id) {
        setCurrentCate(item as Cate);
      }
    });
  };

  // 笔记本分类有值的时候构建菜单
  useEffect(() => {
    const menusTemp: MenuItemType[] = [];
    if (cateList && cateList.length) {
      cateList.forEach((item) => {
        menusTemp.push({
          label: <MenuItem label={item.name} count={item.counts} />,
          key: item.id,
          icon: <FolderOutlined style={{ fontSize: '16px' }} />,
        });
      });
      setMenus(menusTemp);
    }
  }, [cateList]);

  // 获取笔记本分类列表
  useEffect(() => {
    getNoteCounts();
    getCateList();
  }, []);

  // 当前分类变化的时候自动拉取笔记列表
  useEffect(() => {
    getNoteList();
  }, [currentCate]);

  // 笔记分类名称输入
  const handleNameInput = (e) => {
    // console.log(e.target.value);
    setNewCateName(e.target.value);
  };

  // 提交创建笔记本
  const handleCreateNote = () => {
    if (!newCateName || !newCateName.length) {
      message.error('请输入分类名称');
      return;
    }
    // 如果当前的笔记本已经达到20个了，不给创建了
    if (cateList?.length >= 20) {
      message.error('最多创建20个分类');
      return;
    }
    userLog('Create Notebook Cate:', newCateName);
    request
      .post('/cate/create', {
        name: newCateName,
      })
      .then(() => {
        setNewCateName('');
        setShowNewModal(false);
        getCateList();
        message.success(`创建成功`);
      })
      .catch((err) => {
        userLog('Create Notebook Cate failed:', err);
        message.error(`创建失败：${err.message}`);
      });
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowNewModal(open);
    if (open) {
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 200);
    }
  };

  // 创建笔记本表单
  const createNoteForm = (
    <div>
      <Input
        placeholder={`最多8个字符`}
        value={newCateName}
        maxLength={8}
        allowClear
        onChange={handleNameInput}
        onPressEnter={handleCreateNote}
        ref={inputRef}
      />
      <div className={style.tips}>输入完后按下回车提交</div>
    </div>
  );

  // 选中一个笔记分类
  const handleCateSelect = (e) => {
    const { key } = e;
    cateList.forEach((item) => {
      if (item.id == key && item.id !== currentCate.id) {
        setCurrentCate(item as Cate);
      }
    });
  };

  return (
    <>
      <div className={style.cateContainer} style={{ borderBottom: '1px solid #E5E5E5' }}>
        <Menu
          defaultSelectedKeys={['all']}
          selectedKeys={[currentCate?.id + '']}
          mode="inline"
          items={items}
          style={{ borderRight: 0 }}
          onSelect={handleHandCateSelect}
        />
      </div>
      <div className={style.cateContainer}>
        <div className={style.cateTitle}>
          <span>
            笔记分类<em className={style.titleTips}>[{cateList?.length || 0}/20]</em>
          </span>
          <Popover
            content={createNoteForm}
            title={`新建笔记分类`}
            trigger={`click`}
            open={showNewModal}
            onOpenChange={handleModalOpenChange}
            placement={`rightTop`}
          >
            <Button type={`text`} size={`small`} icon={<PlusOutlined />} />
          </Popover>
        </div>
        {!cateList || !cateList.length ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`还没有任何分类`} />
        ) : (
          <Menu
            defaultSelectedKeys={[]}
            selectedKeys={[currentCate?.id + '']}
            mode={`inline`}
            items={menus}
            className={style.menuContainer}
            style={{ borderRight: 0 }}
            onSelect={handleCateSelect}
          ></Menu>
        )}
      </div>
    </>
  );
};

export default memo(Category);
