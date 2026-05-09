import React, { memo, useContext, useEffect, useState } from 'react';
import { Menu, Empty } from 'antd';
import { FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { ReportContext, ReportCate } from './context';
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
  const { currentCate, setCurrentCate, reportCounts, getReportGroups } = useContext(ReportContext);

  const [monthGroups, setMonthGroups] = useState<{ month: string; count: number }[]>([]);

  // 全部报告分类
  const allCate: ReportCate = {
    id: 'all',
    name: '全部报告',
    type: 'all',
    isVirtual: true,
  };

  // 日报分类
  const dailyCate: ReportCate = {
    id: 'daily',
    name: '全部日报',
    type: 'daily',
    isVirtual: true,
  };

  // 月报分类
  const monthlyCate: ReportCate = {
    id: 'monthly',
    name: '全部月报',
    type: 'monthly',
    isVirtual: true,
  };

  useEffect(() => {
    getReportGroups().then((groups) => {
      setMonthGroups(groups);
    });
  }, []);

  // 构建月份分组菜单
  const monthMenus = monthGroups.map(({ month, count }) => ({
    key: `month-${month}`,
    label: <MenuItem label={month} count={count} />,
    onClick: () => {
      setCurrentCate({
        id: `month-${month}`,
        name: month,
        type: 'month',
        isVirtual: true,
      });
    },
  }));

  const handleCateSelect = (e: { key: string }) => {
    const { key } = e;
    if (key === 'all') {
      setCurrentCate(allCate);
    } else if (key === 'daily') {
      setCurrentCate(dailyCate);
    } else if (key === 'monthly') {
      setCurrentCate(monthlyCate);
    }
  };

  const getSelectedKey = () => {
    if (currentCate.type === 'all') return 'all';
    if (currentCate.type === 'daily') return 'daily';
    if (currentCate.type === 'monthly') return 'monthly';
    if (currentCate.type === 'month') return currentCate.id as string;
    return 'all';
  };

  // 固定菜单
  const fixedMenus = [
    {
      key: 'all',
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: <MenuItem label="全部报告" count={reportCounts.all} />,
    },
    {
      key: 'daily',
      icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
      label: <MenuItem label="全部日报" count={reportCounts.daily} />,
    },
    {
      key: 'monthly',
      icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
      label: <MenuItem label="全部月报" count={reportCounts.monthly} />,
    },
  ];

  return (
    <>
      <div className={style.cateContainer} style={{ borderBottom: '1px solid var(--ant-color-border)' }}>
        <Menu
          defaultSelectedKeys={['all']}
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          items={fixedMenus}
          style={{ borderRight: 0 }}
          onSelect={handleCateSelect}
        />
      </div>
      <div className={style.cateContainer}>
        <div className={style.cateTitle}>
          <span>
            报告分组<em className={style.titleTips}>[按月份]</em>
          </span>
        </div>
        {monthMenus.length > 0 && (
          <Menu
            defaultSelectedKeys={[]}
            selectedKeys={[getSelectedKey()]}
            mode="inline"
            items={monthMenus}
            className={style.menuContainer}
            style={{ borderRight: 0 }}
          />
        )}

        {monthMenus.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无月份分组" />}
      </div>
    </>
  );
};

export default memo(Category);
