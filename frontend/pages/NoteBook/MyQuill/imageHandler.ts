import { Quill } from 'react-quill';
import { message } from 'antd';
import request from '@commons/request';

// 添加对Quill模块的引用
const Clipboard = Quill.import('modules/clipboard');

// 创建自定义粘贴处理模块
export class ImagePasteHandler extends Clipboard {
  onPaste(e: ClipboardEvent) {
    // 检查剪贴板中是否有图片文件
    const clipboardData = e.clipboardData;
    if (clipboardData && clipboardData.items) {
      // 遍历剪贴板中的项目
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        // 检查是否为图片文件
        if (item.type.indexOf('image') !== -1) {
          // 阻止默认的粘贴行为
          e.preventDefault();

          // 获取图片文件
          const file = item.getAsFile();
          if (file) {
            // 触发自定义事件，传递图片文件
            const customEvent = new CustomEvent('imagePasted', {
              detail: { file },
            });
            window.dispatchEvent(customEvent);
          }
          // 只处理第一个图片文件
          return;
        }
      }
    }

    // 如果没有图片文件，调用父类的onPaste方法处理其他内容
    super.onPaste(e);
  }
}

// 处理粘贴图片的逻辑
export const handleImagePasted = async (quillRef: React.RefObject<any>, e: CustomEvent) => {
  const { file } = e.detail;
  if (file) {
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', file);

      // 显示上传中提示
      message.loading('图片上传中...', 0);

      // 上传图片到服务器
      const response = await request.post('/common/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 隐藏上传中提示
      message.destroy();

      if (response.data.success) {
        // 获取Quill实例
        const quill = quillRef.current?.getEditor();
        if (quill) {
          // 获取当前光标位置
          const range = quill.getSelection(true);
          if (range) {
            // 插入自定义图片Blot，包含默认尺寸
            const imagePath = response.data.filePath;
            quill.insertEmbed(range.index, 'customImage', {
              src: imagePath,
              width: '400',
              height: '300',
            });
            // 移动光标到图片后面
            quill.setSelection(range.index + 1, 0);
          }
        }
        message.success('图片上传成功');
      } else {
        message.error(response.data.error || '图片上传失败');
      }
    } catch (error: any) {
      message.destroy();
      message.error(error.response?.data?.error || '图片上传失败');
      console.error('图片上传错误:', error);
    }
  }
};
