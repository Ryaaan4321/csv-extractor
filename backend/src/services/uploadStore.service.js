import crypto from 'crypto'
const store = new Map();
const TTL_MS = 30 * 60 * 1000;

const saveUpload = (data) => {
  const uploadId = crypto.randomUUID();
  store.set(uploadId, { ...data, createdAt: Date.now() });

  setTimeout(() => {
    store.delete(uploadId);
  }, TTL_MS);

  return uploadId;
};

const getUpload = (uploadId) => {
  return store.get(uploadId) || null;
};

export {saveUpload,getUpload}