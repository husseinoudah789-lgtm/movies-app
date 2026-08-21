export const API_KEY = '844dba0bfd8f3a4f3799f6130ef9e335';
const BASE_URL = 'https://api.themoviedb.org/3';

// جلب الشائع اليوم
export const fetchTrending = async (page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=${lang}&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching trending:", error);
    return { results: [] };
  }
};

// جلب الأفلام الشائعة
export const fetchPopularMovies = async (page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${lang}&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return { results: [] };
  }
};

// جلب المسلسلات الشائعة
export const fetchPopularTVShows = async (page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${lang}&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    return { results: [] };
  }
};

// جلب الأفلام والمسلسلات العربية
export const fetchArabicContent = async (type = 'movie', page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_original_language=ar&sort_by=popularity.desc&page=${page}&language=${lang}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching Arabic content:", error);
    return { results: [] };
  }
};

// جلب حسب التصنيف (Genre)
export const fetchByGenre = async (type = 'movie', genreId, page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching by genre:", error);
    return { results: [] };
  }
};

// جلب محتوى الأنمي والرسوم المتحركة اليابانية
export const fetchAnimeContent = async (type = 'tv', page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=16&with_original_language=ja&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching anime:", error);
    return { results: [] };
  }
};

// جلب الدراما الكورية والآسيوية (K-Drama)
export const fetchKDramaContent = async (type = 'tv', page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_original_language=ko&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching K-drama:", error);
    return { results: [] };
  }
};

// جلب الأفلام القادمة وقريباً في السينما
export const fetchUpcomingMovies = async (page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=${lang}&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return { results: [] };
  }
};

// جلب محتوى الأكشن والإثارة
export const fetchActionContent = async (type = 'movie', page = 1, lang = 'ar') => {
  try {
    const genre = type === 'movie' ? '28' : '10759';
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genre}&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching action content:", error);
    return { results: [] };
  }
};

// جلب الأفلام الوثائقية
export const fetchDocumentaries = async (type = 'movie', page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=99&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching documentaries:", error);
    return { results: [] };
  }
};

// جلب محتوى الأطفال والعائلة
export const fetchFamilyContent = async (type = 'movie', page = 1, lang = 'ar') => {
  try {
    const genres = type === 'movie' ? '10751,16' : '10762,16';
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genres}&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching family content:", error);
    return { results: [] };
  }
};

// جلب الأعلى تقييماً
export const fetchTopRated = async (type = 'movie', page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/${type}/top_rated?api_key=${API_KEY}&language=${lang}&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching top rated:", error);
    return { results: [] };
  }
};

// جلب التفاصيل الكاملة
export const fetchMediaDetails = async (type, id, lang = 'ar') => {
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const res = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,similar&language=${lang}`);
    const data = await res.json();

    if (!data.videos || !data.videos.results || data.videos.results.length === 0) {
      const enRes = await fetch(`${BASE_URL}/${mediaType}/${id}/videos?api_key=${API_KEY}`);
      const enData = await enRes.json();
      data.videos = enData;
    }

    return data;
  } catch (error) {
    console.error("Error fetching media details:", error);
    return null;
  }
};

// البحث الشامل
export const searchContent = async (query, lang = 'ar') => {
  if (!query) return { results: [] };
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}&language=${lang}`);
    return await res.json();
  } catch (error) {
    console.error("Error searching:", error);
    return { results: [] };
  }
};
