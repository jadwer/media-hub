import { describe, it, expect, vi } from 'vitest';
import { getAllTypes } from './index.js';

global.fetch = vi.fn();

describe('getAllTypes', () => {
  it('fetches audio, video and image files independently', async () => {
    fetch.mockImplementation((url) => {
      const urlObj = new URL(url);
      const type = urlObj.searchParams.get('type');

      return Promise.resolve({
        json: () => Promise.resolve({
          type,
          page: 1,
          perPage: 4,
          total: 2,
          files: [{ name: `${type}1.mp3`, type }]
        })
      });
    });

    const result = await getAllTypes({ perPage: 4 });

    expect(result).toHaveProperty('audio');
    expect(result).toHaveProperty('video');
    expect(result).toHaveProperty('image');

    expect(result.audio.files[0].type).toBe('audio');
    expect(result.video.files[0].type).toBe('video');
    expect(result.image.files[0].type).toBe('image');
  });
});
