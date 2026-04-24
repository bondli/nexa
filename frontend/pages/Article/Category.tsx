import React, { memo, useContext, useRef, useState, useEffect } from 'react';
import { ProductOutlined, FileTextOutlined, DeleteOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Popover, Input, App, Empty, Button } from 'antd';
import { userLog } from '@commons/electron';
import request from '@commons/request';
import { ArticleCate } from './constant';
import { ArticleContext } from './context';
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
    articleCounts = {},
    cateList,
    getArticleCateList,
    getArticleCounts,
    getArticleList,
    getTempArticleList,
    isTempCategory,
  } = useContext(ArticleContext);

  // 文章分类菜单
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  // 创建文章分类弹窗
  const [showNewModal, setShowNewModal] = useState(false);
  // 创建文章分类名称
  const [newCateName, setNewCateName] = useState('');
  // 创建文章分类输入框
  const inputRef = useRef(null);

  // 虚拟分类列表
  const virtualCates: ArticleCate[] = [
    {
      id: 'all',
      name: '全部文章',
      counts: articleCounts.all || 0,
      icon: <ProductOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
    {
      id: 'temp',
      name: '临时文章',
      counts: articleCounts.temp || 0,
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
    {
      id: 'trash',
      name: '回收站',
      counts: articleCounts.deleted || 0,
      icon: <DeleteOutlined style={{ fontSize: '16px' }} />,
      isVirtual: true,
    },
  ];

  // 构建虚拟分类菜单项
  const virtualItems: MenuItemType[] = virtualCates.map((item) => ({
    key: item.id,
    icon: item.icon,
    label: <MenuItem label={item.name} count={item.counts} />,
  }));

  // 选中一个虚拟分类
  const handleVirtualCateSelect = (e: { key: string }) => {
    const { key } = e;
    virtualCates.forEach((item) => {
      if (item.id === key && item.id !== currentCate.id) {
        setCurrentCate(item as ArticleCate);
      }
    });
  };

  // 构建用户分类菜单项
  useEffect(() => {
    const menusTemp: MenuItemType[] = [];
    // 过滤掉虚拟分类，只保留用户创建的分类
    const userCates = cateList.filter((item) => !item.isVirtual);
    if (userCates && userCates.length) {
      userCates.forEach((item) => {
        menusTemp.push({
          label: <MenuItem label={item.name} count={item.counts} />,
          key: item.id,
          icon: <FolderOutlined style={{ fontSize: '16px' }} />,
        });
      });
    }
    setMenus(menusTemp);
  }, [cateList]);

  // 获取文章分类列表
  useEffect(() => {
    getArticleCounts();
    getArticleCateList();
  }, []);

  // 当前分类变化的时候自动拉取文章列表
  useEffect(() => {
    if (isTempCategory) {
      getTempArticleList();
    } else {
      getArticleList();
    }
  }, [currentCate]);

  // 分类名称输入
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCateName(e.target.value);
  };

  // 提交创建文章分类
  const handleCreateCate = () => {
    if (!newCateName || !newCateName.length) {
      message.error('请输入分类名称');
      return;
    }
    if (cateList?.length >= 20) {
      message.error('最多创建20个分类');
      return;
    }
    userLog('Create Article Cate:', newCateName);
    request
      .post('/article_cate/create', {
        name: newCateName,
      })
      .then(() => {
        setNewCateName('');
        setShowNewModal(false);
        getArticleCateList();
        message.success('创建成功');
      })
      .catch((err) => {
        userLog('Create Article Cate failed:', err);
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

  // 创建分类表单
  const createCateForm = (
    <div>
      <Input
        placeholder={`最多16个字符`}
        value={newCateName}
        maxLength={16}
        allowClear
        onChange={handleNameInput}
        onPressEnter={handleCreateCate}
        ref={inputRef}
      />
      <div className={style.tips}>输入完后按下回车提交</div>
    </div>
  );

  // 选中一个文章分类
  const handleCateSelect = (e: { key: string }) => {
    const { key } = e;
    const userCates = cateList.filter((item) => !item.isVirtual);
    userCates.forEach((item) => {
      if (item.id === Number(key) && item.id !== currentCate.id) {
        setCurrentCate(item as ArticleCate);
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
          items={virtualItems}
          style={{ borderRight: 0 }}
          onSelect={handleVirtualCateSelect}
        />
      </div>
      <div className={style.cateContainer}>
        <div className={style.cateTitle}>
          <span>
            文章分类<em className={style.titleTips}>[{cateList?.filter((item) => !item.isVirtual).length || 0}/20]</em>
          </span>
          <Popover
            content={createCateForm}
            title={`新建文章分类`}
            trigger={`click`}
            open={showNewModal}
            onOpenChange={handleModalOpenChange}
            placement={`rightTop`}
          >
            <Button type={`text`} size={`small`} icon={<PlusOutlined />} />
          </Popover>
        </div>
        {!cateList || !cateList.filter((item) => !item.isVirtual).length ? (
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
          />
        )}
      </div>
    </>
  );
};

export default memo(Category);
