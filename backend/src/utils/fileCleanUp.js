import fs from 'fs/promises'

const deleteFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error(`Failed to delete temp file at ${filePath}:`, err.message);
  }
};
export default deleteFile;