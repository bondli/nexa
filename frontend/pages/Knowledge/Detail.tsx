import React, { memo, useState, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import request from '@commons/request';
import { DocumentType } from './constant';
import style from './index.module.less';

type DetailProps = {
  selectedDocument: DocumentType | null;
};

const Detail: React.FC<DetailProps> = (props) => {
  const { selectedDocument } = props;
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
        if (docInfo && docInfo.path) {
          // 在 Electron 环境下，可以通过 preload 暴露的接口来读取文件
          // 这里暂时使用空内容，后续可以通过 Electron API 来读取
          // TODO: 通过 Electron bridge 读取本地文件
          setContent('');
        }
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
    <div className={style.detailContainer} data-color-mode="light">
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
            height="100%"
            style={{ minHeight: '400px' }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default memo(Detail);
