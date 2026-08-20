export const API_KEY = '844dba0bfd8f3a4f3799f6130ef9e335';
const BASE_URL = 'https://api.themoviedb.org/3';

// جلب الشائع
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

// جلب حسب التصنيف
export const fetchByGenre = async (type = 'movie', genreId, page = 1, lang = 'ar') => {
  try {
    const res = await fetch(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&language=${lang}&sort_by=popularity.desc&page=${page}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching by genre:", error);
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

// جلب التفاصيل الكاملة مع دعم تغيير لغة المحتوى
export const fetchMediaDetails = async (type, id, lang = 'ar') => {
  try {
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    const res = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,similar&language=${lang}`);
    const data = await res.json();

    // إذا لم تكن هناك فيديوهات في اللغة المحددة، نجلب باللغة الإنجليزية كبديل
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
