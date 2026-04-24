import React, { memo, useState, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import request from '@commons/request';
import { getResolvedTheme } from '@utils/theme';
import { DocumentType } from './constant';
import style from './index.module.less';

type DetailProps = {
  selectedDocument: DocumentType | null;
};

const Detail: React.FC<DetailProps> = (props) => {
  const { selectedDocument } = props;
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 获取当前主题
  const isDark = getResolvedTheme() === 'dark';

  // 加载文档内容
  useEffect(() => {
    if (!selectedDocument?.id) {
      setContent('');
      return;
    }

    const loadContent = async () => {
      setLoading(true);
      try {
        // 先获取文档信息
        const infoResponse = await request.get(`/docs/info?id=${selectedDocument.id}`);
        const docInfo = infoResponse.data;
        setContent(docInfo.content || '');
      } catch (error) {
        console.error('加载文档内容失败:', error);
        setContent('');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [selectedDocument]);

  if (!selectedDocument) {
    return (
      <div className={style.detailEmpty}>
        <Empty description="请选择一个文档查看" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className={style.detailContainer} data-color-mode={isDark ? 'dark' : 'light'}>
      <div className={style.detailHeader}>
        <h2 className={style.detailTitle}>{selectedDocument.name}</h2>
      </div>
      <div className={style.detailContent}>
        <Spin spinning={loading}>
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            preview="preview"
            hideToolbar={true}
            height={600}
            style={{ width: '100%' }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default memo(Detail);
