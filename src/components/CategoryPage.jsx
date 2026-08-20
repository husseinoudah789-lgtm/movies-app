import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';

export default function CategoryPage({ title, icon, fetchFunction, mediaType, onBack }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchFunction(1);
      setItems(data.results || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchFunction(nextPage);
    setItems(prev => [...prev, ...(data.results || [])]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
        >
          <span>→</span>
          <span>رجوع</span>
        </button>
        <h2 className="text-3xl font-bold text-white">
          {icon} {title}
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {items.map((item, index) => (
              <MovieCard key={`${item.id}-${index}`} item={{...item, media_type: mediaType || item.media_type}} />
            ))}
          </div>

          {/* زر تحميل المزيد */}
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold px-8 py-3 rounded-full transition-colors text-lg"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></span>
                  جاري التحميل...
                </span>
              ) : (
                'عرض المزيد'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
