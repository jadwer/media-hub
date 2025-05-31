import { describe, it, expect, beforeEach } from 'vitest';
import { renderFiles } from '@ui/fileViewer.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="fileList"></div>
    <div id="pageInfo"></div>
  `;
});

describe('renderFiles', () => {
  it('renders a list of files', () => {
    const files = [
      { name: 'song1.mp3', url: '/files/song1.mp3', type: 'audio', extension: 'mp3', modified: '2025-05-01 12:00:00' },
      { name: 'song2.mp3', url: '/files/song2.mp3', type: 'audio', extension: 'mp3', modified: '2025-05-01 12:00:01' }
    ];

    renderFiles(files, 1);

    const items = document.querySelectorAll('.file-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('song1');
  });
});
