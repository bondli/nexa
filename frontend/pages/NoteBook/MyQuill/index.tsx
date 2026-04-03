import React, { useEffect, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import CustomImageBlot from './CustomImageBlot';
import { ImagePasteHandler, handleImagePasted } from './imageHandler';
import registerUrlLinkPlugin from './UrlLinkPlugin';

import 'react-quill/dist/quill.snow.css';
import './editor.css';

// 注册自定义Blot
Quill.register(CustomImageBlot);
// 注册自定义模块
Quill.register('modules/clipboard', ImagePasteHandler, true);
// 注册URL链接插件
registerUrlLinkPlugin();

interface MyQuillProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const MyQuill: React.FC<MyQuillProps> = ({ value, onChange, onBlur, placeholder = '请输入内容' }) => {
  const quillRef = useRef<ReactQuill>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化编辑器内容，避免自动去掉HTML标签
  useEffect(() => {
    if (!isInitialized && value) {
      // 先设置空值，然后再设置实际值
      setInternalValue('');
      setTimeout(() => {
        setInternalValue(value);
        setIsInitialized(true);
      }, 0);
    } else if (!value && isInitialized) {
      // 如果value为空，重置状态
      setInternalValue('');
      setIsInitialized(false);
    } else if (value && isInitialized) {
      // 如果已经初始化且有新值，直接更新
      setInternalValue(value);
    }
  }, [value, isInitialized]);

  // 在组件挂载后添加图片点击事件监听器
  useEffect(() => {
    // 更新调整容器位置的函数
    const updateResizeContainerPosition = () => {
      const img = document.querySelector('.resizable-quill-image.selected');
      const resizeContainer = document.getElementById('image-resize-container');

      if (img && resizeContainer) {
        const rect = img.getBoundingClientRect();
        resizeContainer.style.left = rect.left + 'px';
        resizeContainer.style.top = rect.top + 'px';
      }
    };

    const handleClick = (e: any) => {
      if (e.target.tagName === 'IMG' && e.target.classList.contains('resizable-quill-image')) {
        // 切换选中状态
        if (e.target.classList.contains('selected')) {
          e.target.classList.remove('selected');
          // 移除临时调整容器
          cleanupImageSelection();
        } else {
          // 移除其他图片的选中状态
          const selectedImages = document.querySelectorAll('.resizable-quill-image.selected');
          selectedImages.forEach((img) => {
            img.classList.remove('selected');
          });

          // 移除现有的调整容器
          cleanupImageSelection();

          // 添加当前图片的选中状态
          e.target.classList.add('selected');

          // 保存原始宽高比
          const imgElement = e.target as HTMLImageElement;
          if (!imgElement.dataset.aspectRatio) {
            const naturalWidth = imgElement.naturalWidth || imgElement.width;
            const naturalHeight = imgElement.naturalHeight || imgElement.height;
            imgElement.dataset.aspectRatio = (naturalWidth / naturalHeight).toString();
          }

          // 先确保没有重复的调整容器
          const existingContainer = document.getElementById('image-resize-container');
          if (existingContainer) {
            existingContainer.remove();
          }

          // 创建临时调整容器
          const rect = e.target.getBoundingClientRect();
          const container = document.createElement('div');
          container.id = 'image-resize-container';
          container.style.position = 'fixed';
          container.style.left = rect.left + 'px';
          container.style.top = rect.top + 'px';
          container.style.width = rect.width + 'px';
          container.style.height = rect.height + 'px';
          container.style.pointerEvents = 'none';
          container.style.zIndex = '9999';

          // 创建调整手柄元素
          const createHandle = (className: string) => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${className}`;
            handle.style.pointerEvents = 'auto';
            return handle;
          };

          const topLeftHandle = createHandle('resize-handle-top-left');
          const topRightHandle = createHandle('resize-handle-top-right');
          const bottomLeftHandle = createHandle('resize-handle-bottom-left');
          const bottomRightHandle = createHandle('resize-handle-bottom-right');

          container.appendChild(topLeftHandle);
          container.appendChild(topRightHandle);
          container.appendChild(bottomLeftHandle);
          container.appendChild(bottomRightHandle);

          document.body.appendChild(container);
        }
      } else if (
        !e.target.classList.contains('resizable-quill-image') &&
        !e.target.classList.contains('resize-handle')
      ) {
        // 点击其他地方时取消所有图片的选中状态
        cleanupImageSelection();
      }
    };

    // 添加键盘事件监听器，用于删除选中的图片
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了删除键
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedImage = document.querySelector('.resizable-quill-image.selected');
        if (selectedImage) {
          e.preventDefault();

          // 获取Quill实例
          const quill = quillRef.current?.getEditor();
          if (quill) {
            // 先移除调整容器（手柄框）
            cleanupImageSelection();

            // 再移除选中的图片元素
            selectedImage.remove();

            // 设置光标位置到图片原来的位置
            const selection = quill.getSelection();
            if (selection) {
              quill.setSelection(selection.index, 0);
            }
          }
        }
      }
    };

    // 提取清理图片选中状态的逻辑为独立函数
    const cleanupImageSelection = () => {
      // 移除所有图片的选中状态
      const selectedImages = document.querySelectorAll('.resizable-quill-image.selected');
      selectedImages.forEach((img) => {
        img.classList.remove('selected');
      });

      // 移除调整容器
      const resizeContainer = document.getElementById('image-resize-container');
      if (resizeContainer) {
        resizeContainer.remove();
      }

      // 额外确保没有残留的调整容器
      const allContainers = document.querySelectorAll('#image-resize-container');
      allContainers.forEach((container) => {
        container.remove();
      });
    };

    // 添加调整大小功能
    const handleMouseDown = (e: MouseEvent) => {
      // 检查是否点击了选中图片的调整手柄
      if (e.target instanceof HTMLElement) {
        const resizeContainer = document.getElementById('image-resize-container');
        if (resizeContainer) {
          const img = document.querySelector('.resizable-quill-image.selected');
          if (img) {
            // 检查点击的是哪个调整手柄
            const isTopLeft = e.target.classList.contains('resize-handle-top-left');
            const isTopRight = e.target.classList.contains('resize-handle-top-right');
            const isBottomLeft = e.target.classList.contains('resize-handle-bottom-left');
            const isBottomRight = e.target.classList.contains('resize-handle-bottom-right');

            // 确定调整方向
            let resizeDirection = '';
            if (isTopLeft) resizeDirection = 'top-left';
            else if (isTopRight) resizeDirection = 'top-right';
            else if (isBottomLeft) resizeDirection = 'bottom-left';
            else if (isBottomRight) resizeDirection = 'bottom-right';

            if (resizeDirection) {
              e.preventDefault();

              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = img.clientWidth;
              const startHeight = img.clientHeight;
              // 获取原始宽高比
              const aspectRatio = parseFloat((img as HTMLImageElement).dataset.aspectRatio || '1');

              const handleMouseMove = (moveEvent: MouseEvent) => {
                // 计算鼠标移动距离
                const diffX = moveEvent.clientX - startX;
                const diffY = moveEvent.clientY - startY;

                let newWidth, newHeight;

                // 根据调整方向计算新尺寸，保持宽高比
                switch (resizeDirection) {
                  case 'top-left':
                    newWidth = Math.max(50, startWidth - diffX);
                    newHeight = newWidth / aspectRatio;
                    break;

                  case 'top-right':
                    newWidth = Math.max(50, startWidth + diffX);
                    newHeight = newWidth / aspectRatio;
                    break;

                  case 'bottom-left':
                    newWidth = Math.max(50, startWidth - diffX);
                    newHeight = newWidth / aspectRatio;
                    break;

                  case 'bottom-right':
                  default:
                    newWidth = Math.max(50, startWidth + diffX);
                    newHeight = newWidth / aspectRatio;
                    break;
                }

                // 应用新尺寸（不改变位置）
                const styledImg = img as HTMLElement;
                styledImg.style.width = newWidth + 'px';
                styledImg.style.height = newHeight + 'px';

                // 更新容器大小
                if (resizeContainer) {
                  resizeContainer.style.width = newWidth + 'px';
                  resizeContainer.style.height = newHeight + 'px';
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);

                // 保存尺寸变更到Quill编辑器
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  // 更新图片的属性
                  const newWidth = parseInt((img as HTMLElement).style.width);
                  const newHeight = parseInt((img as HTMLElement).style.height);
                  img.setAttribute('width', newWidth.toString());
                  img.setAttribute('height', newHeight.toString());

                  // 获取更新后的内容并保存
                  const updatedContent = quill.root.innerHTML;
                  onChange(updatedContent);
                }
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }
        }
      }
    };

    // 添加点击事件监听器到编辑器容器
    const editorElement = quillRef.current?.getEditor()?.root;
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown); // 添加键盘事件监听

      // 添加滚动和窗口大小变化监听器
      window.addEventListener('scroll', updateResizeContainerPosition);
      window.addEventListener('resize', updateResizeContainerPosition);

      // 清理事件监听器
      return () => {
        editorElement.removeEventListener('click', handleClick);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('keydown', handleKeyDown); // 移除键盘事件监听
        window.removeEventListener('scroll', updateResizeContainerPosition);
        window.removeEventListener('resize', updateResizeContainerPosition);
      };
    }
  }, [onChange]);

  // 处理粘贴图片的逻辑
  useEffect(() => {
    // 添加事件监听器
    const handleImagePasteEvent = (e: CustomEvent) => {
      handleImagePasted(quillRef, e);
    };

    window.addEventListener('imagePasted', handleImagePasteEvent as EventListener);

    // 清理事件监听器
    return () => {
      window.removeEventListener('imagePasted', handleImagePasteEvent as EventListener);
    };
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
    urlLink: {}, // 启用URL链接插件
  };

  return (
    <div ref={editorRef}>
      <ReactQuill
        ref={quillRef}
        theme={`snow`}
        value={internalValue}
        onChange={(newValue) => {
          setInternalValue(newValue);
          onChange(newValue);
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        modules={modules}
      />
    </div>
  );
};

export default MyQuill;
