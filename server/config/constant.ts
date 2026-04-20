const PORT = Number(process.env.PORT) || 7777;
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
const ALLOWED_FILE_EXTENSIONS = ['.md', '.txt', '.pdf', '.doc', '.docx'];

export { PORT, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_FILE_EXTENSIONS };
