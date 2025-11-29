import { PEXELS_API_KEY, ART_QUERIES } from '../constants';
import { PexelsResponse, PexelsPhoto } from '../types';

const BASE_URL = 'https://api.pexels.com/v1';

const headers = {
  Authorization: PEXELS_API_KEY,
};

/**
 * Fetches a batch of art-related photos.
 */
export const fetchArtPhotos = async (page: number = 1, perPage: number = 10): Promise<PexelsPhoto[]> => {
  // Randomize the query slightly to get variety on refresh
  const query = ART_QUERIES[Math.floor(Math.random() * ART_QUERIES.length)];
  
  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: PexelsResponse = await response.json();
    return data.photos;
  } catch (error) {
    console.error("Failed to fetch art photos:", error);
    return [];
  }
};

/**
 * Fetches a single random art photo to inject into the feed.
 */
export const fetchRandomArtPhoto = async (): Promise<PexelsPhoto | null> => {
  // To get a "random" feel, we pick a random query and a random page (1-100)
  const query = ART_QUERIES[Math.floor(Math.random() * ART_QUERIES.length)];
  const randomPage = Math.floor(Math.random() * 50) + 1;

  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=1&page=${randomPage}&orientation=portrait`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: PexelsResponse = await response.json();
    if (data.photos.length > 0) {
      return data.photos[0];
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch random photo:", error);
    return null;
  }
};

/**
 * Browser-native image preloading to prevent flickering.
 */
export const preloadImage = (url: string) => {
  const img = new Image();
  img.src = url;
};
