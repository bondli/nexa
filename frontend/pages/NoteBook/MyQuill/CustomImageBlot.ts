import Quill from 'quill';

const Embed = Quill.import('blots/embed');

class CustomImageBlot extends Embed {
  static create(value) {
    const node = super.create();

    if (typeof value === 'string') {
      // 仅提供src的情况
      node.setAttribute('src', value);
    } else if (typeof value === 'object' && value.src) {
      // 提供src、width、height的情况
      node.setAttribute('src', value.src);
      if (value.width) node.setAttribute('width', value.width);
      if (value.height) node.setAttribute('height', value.height);
    }

    node.setAttribute('alt', '');
    node.setAttribute('class', 'resizable-quill-image');
    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute('src'),
      width: node.getAttribute('width') || '',
      height: node.getAttribute('height') || '',
    };
  }

  static formats(node) {
    return {
      width: node.getAttribute('width') || '',
      height: node.getAttribute('height') || '',
    };
  }

  format(name, value) {
    if (name === 'width' || name === 'height') {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

CustomImageBlot.blotName = 'customImage';
CustomImageBlot.tagName = 'img';

export default CustomImageBlot;
