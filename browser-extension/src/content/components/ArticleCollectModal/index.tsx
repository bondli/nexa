import React, { useState, useEffect } from 'react';
import { Modal, Tabs, App as AntdApp } from 'antd';
import type { TabsProps } from 'antd';
import Step1Collect from './Step1Collect';
import Step2Summarize from './Step2Summarize';
import Step3GenerateImage from './Step3GenerateImage';
import styles from './index.module.less';

interface ArticleCollectModalProps {
  open: boolean;
  onClose: () => void;
  initialData: {
    title: string;
    content: string;
    url: string;
  };
  selectedCategory: number;
  categories: { id: number; name: string }[];
  onSave: (data: { title: string; desc: string; url: string; cateId: number; summary: string; image: string }) => void;
}

const ArticleCollectModal: React.FC<ArticleCollectModalProps> = ({
  open,
  onClose,
  initialData,
  selectedCategory,
  categories,
  onSave,
}) => {
  const { message } = AntdApp.useApp();
  const [activeStep, setActiveStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [step3Completed, setStep3Completed] = useState(false);

  // 步骤数据
  const [collectedContent, setCollectedContent] = useState(initialData.content);
  const [collectedTitle, setCollectedTitle] = useState(initialData.title);
  const [summary, setSummary] = useState('');

  // 每次 Modal 打开时重置所有步骤状态和数据
  useEffect(() => {
    if (open) {
      setCollectedTitle(initialData.title);
      setCollectedContent(initialData.content);
      setActiveStep('step1');
      setStep1Completed(false);
      setStep2Completed(false);
      setStep3Completed(false);
      setSummary('');
    }
  }, [open]);

  // Step1 完成
  const handleStep1Complete = (data: { title: string; content: string }) => {
    setCollectedTitle(data.title);
    setCollectedContent(data.content);
    setStep1Completed(true);
    setActiveStep('step2');
  };

  // Step2 完成
  const handleStep2Complete = (summarizedContent: string) => {
    setSummary(summarizedContent);
    setStep2Completed(true);
    setActiveStep('step3');
  };

  // Step3 完成
  const handleStep3Complete = (imageUrl: string, selectedCategory: number | null) => {
    setStep3Completed(true);

    // 调用保存接口
    onSave({
      title: collectedTitle,
      desc: collectedContent,
      url: initialData.url,
      cateId: selectedCategory,
      summary,
      image: imageUrl,
    });
    onClose();
  };

  // Tab 项
  const items: TabsProps['items'] = [
    {
      key: 'step1',
      label: (
        <span className={step1Completed ? styles.tabCompleted : undefined}>
          {step1Completed ? '✓ ' : ''}Step 1: 采集原文
        </span>
      ),
      disabled: false,
    },
    {
      key: 'step2',
      label: (
        <span className={step2Completed ? styles.tabCompleted : !step1Completed ? styles.tabDisabled : undefined}>
          {step2Completed ? '✓ ' : ''}Step 2: AI总结
        </span>
      ),
      disabled: !step1Completed,
    },
    {
      key: 'step3',
      label: (
        <span className={step3Completed ? styles.tabCompleted : !step2Completed ? styles.tabDisabled : undefined}>
          {step3Completed ? '✓ ' : ''}Step 3: 生成图片
        </span>
      ),
      disabled: !step2Completed,
    },
  ];

  const handleTabChange = (key: string) => {
    if (key === 'step1') {
      setActiveStep('step1');
    } else if (key === 'step2' && step1Completed) {
      setActiveStep('step2');
    } else if (key === 'step3' && step2Completed) {
      setActiveStep('step3');
    }
  };

  return (
    <Modal
      title="文章采集"
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnHidden={true}
      className={styles.modal}
    >
      <Tabs activeKey={activeStep} onChange={handleTabChange} items={items} className={styles.tabs} />

      <div className={styles.content}>
        {activeStep === 'step1' && (
          <Step1Collect
            initialTitle={collectedTitle}
            initialContent={collectedContent}
            onComplete={handleStep1Complete}
          />
        )}
        {activeStep === 'step2' && (
          <Step2Summarize content={collectedContent} alreadySummary={summary} onComplete={handleStep2Complete} />
        )}
        {activeStep === 'step3' && (
          <Step3GenerateImage
            summary={summary}
            title={collectedTitle}
            selectedCategory={selectedCategory}
            categories={categories}
            onComplete={handleStep3Complete}
          />
        )}
      </div>
    </Modal>
  );
};

export default ArticleCollectModal;
