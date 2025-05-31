// js/api/index.js

const API_URL = '/api/v1.php';

export async function getFiles({ type = 'all', page = 1, perPage = 10, order = 'date_desc' } = {}) {
  try {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
    const url = new URL(API_URL, baseURL);
        url.searchParams.set('type', type);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);
    url.searchParams.set('order', order);

    const response = await fetch(url);
    console.log(`📥 [API] GET ${url}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    throw error;
  }
}

export async function uploadFile(formData) {
  try {
    const response = await fetch('/api/upload.php', {
      method: 'POST',
      body: formData
    });

    console.log('📤 Upload response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
}

export async function getAllTypes({ perPage = 4, order = 'date_desc' } = {}) {
  const types = ['audio', 'video', 'image'];
  const promises = types.map(type =>
    getFiles({ type, page: 1, perPage, order }).then(data => ({ type, data }))
  );

  try {
    const results = await Promise.all(promises);
    return results.reduce((acc, { type, data }) => {
      acc[type] = data;
      return acc;
    }, {});
  } catch (error) {
    console.error('❌ Error loading all types:', error);
    throw error;
  }
}
