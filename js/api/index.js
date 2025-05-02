// js/api/index.js

const API_UPLOAD_URL = '/api/upload.php';
const API_V1_URL = '/api/v1.php';

export async function uploadFile(formData) {
  try {
    const response = await fetch('/api/upload.php', {
      method: 'POST',
      body: formData
    });

    console.log('📤 upload response status:', response.status);
    const data = await response.json();
    console.log('📤 upload response data:', data);
    return data;

  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    throw error;
  }
}

export async function getFiles() {
  try {
    const response = await fetch('/api/v1.php');
    console.log('📥 getFiles response status:', response.status);
    const data = await response.json();
    console.log('📥 getFiles data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en getFiles:', error);
    throw error;
  }
}

// Para implementar en el futuro:
export async function deleteFile(filename) {
  console.warn('deleteFile no implementado aún', filename);
}

export async function approveFile(filename) {
  console.warn('approveFile no implementado aún', filename);
}
