import React, { memo, useContext, useEffect, useState } from 'react';
import { Menu, Popover, Input, Empty, App, Button } from 'antd';
import { PictureOutlined, FolderOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { PictureContext, PictureCate } from './context';
import style from './index.module.less';

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
  const { currentCate, setCurrentCate, cateList, getCateList, createCate, pictureCounts, getPictureCounts } =
    useContext(PictureContext);

  const [menus, setMenus] = useState<any[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCateName, setNewCateName] = useState('');
  const inputRef = React.useRef<any>(null);

  // 全部图片分类
  const allCate: PictureCate = {
    id: 0,
    name: '全部图片',
    counts: 0,
    orders: -1,
    userId: 0,
  };

  // 回收站分类
  const trashCate: PictureCate = {
    id: -1,
    name: '回收站',
    counts: 0,
    orders: -2,
    userId: 0,
    isVirtual: true,
  };

  useEffect(() => {
    getCateList();
    getPictureCounts();
  }, []);

  // 构建菜单
  useEffect(() => {
    const menusTemp: any[] = [];
    if (cateList && cateList.length) {
      cateList.forEach((item) => {
        menusTemp.push({
          label: <MenuItem label={item.name} count={item.counts} />,
          key: item.id,
          icon: <FolderOutlined style={{ fontSize: '16px' }} />,
        });
      });
    }
    setMenus(menusTemp);
  }, [cateList]);

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCateName(e.target.value);
  };

  const handleCreateCate = () => {
    if (!newCateName || !newCateName.length) {
      message.error('请输入分类名称');
      return;
    }
    if (cateList?.length >= 20) {
      message.error('最多创建20个分类');
      return;
    }
    createCate(newCateName)
      .then(() => {
        setNewCateName('');
        setShowNewModal(false);
        message.success('创建成功');
      })
      .catch((err) => {
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

  const createCateForm = (
    <div>
      <Input
        placeholder={`最多20个字符`}
        value={newCateName}
        maxLength={20}
        allowClear
        onChange={handleNameInput}
        onPressEnter={handleCreateCate}
        ref={inputRef}
      />
      <div className={style.tips}>输入完后按下回车提交</div>
    </div>
  );

  const handleCateSelect = (e: { key: string }) => {
    const { key } = e;
    if (key === 'all') {
      setCurrentCate(allCate);
    } else if (key === 'trash') {
      setCurrentCate(trashCate);
    } else {
      const cate = cateList.find((item) => item.id === Number(key));
      if (cate) {
        setCurrentCate(cate);
      }
    }
  };

  // 全部图片菜单
  const allMenu = {
    key: 'all',
    icon: <PictureOutlined style={{ fontSize: '16px' }} />,
    label: <MenuItem label="全部图片" count={pictureCounts.all} />,
  };

  // 回收站菜单
  const trashMenu = {
    key: 'trash',
    icon: <DeleteOutlined style={{ fontSize: '16px' }} />,
    label: <MenuItem label="回收站" count={pictureCounts.trash} />,
  };

  const getSelectedKey = () => {
    if (currentCate?.id === -1) return 'trash';
    if (currentCate?.id === 0 || !currentCate) return 'all';
    return String(currentCate.id);
  };

  return (
    <>
      <div className={style.cateContainer} style={{ borderBottom: '1px solid var(--ant-color-border)' }}>
        <Menu
          defaultSelectedKeys={['all']}
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          items={[allMenu, trashMenu]}
          style={{ borderRight: 0 }}
          onSelect={handleCateSelect}
        />
      </div>
      <div className={style.cateContainer}>
        <div className={style.cateTitle}>
          <span>
            图片分类<em className={style.titleTips}>[{cateList?.length || 0}/20]</em>
          </span>
          <Popover
            content={createCateForm}
            title={`新建图片分类`}
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
            selectedKeys={[getSelectedKey()]}
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
