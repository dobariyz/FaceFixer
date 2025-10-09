import React, { useEffect, useState } from 'react';

const Recommendations = () => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get token from localStorage with correct key
        const token = localStorage.getItem('token');
        
        console.log('🔑 Token:', token ? 'Found' : 'Not found');
        
        if (!token) {
          setError('Please log in to view recommendations');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Fetched data:', data);
        
        setProducts(data || {});
        setLoading(false);
      } catch (err) {
        console.error('❌ Error:', err);
        
        if (err.message.includes('401')) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
        } else {
          setError('Failed to load recommendations');
        }
        
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Personalized Recommendations
          </h1>
          <p className="text-gray-600">
            Products tailored to your skin concerns
          </p>
        </div>

        {Object.keys(products).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No recommendations found.</p>
          </div>
        )}

        {Object.keys(products).map((keyword) => {
          const productList = products[keyword];
          
          if (!productList || !Array.isArray(productList) || productList.length === 0) {
            return null;
          }
          
          return (
            <div key={keyword} className="mb-16">
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
                <h2 className="px-6 text-3xl font-bold text-gray-800 uppercase tracking-wide">
                  {keyword}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {productList.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/270?text=No+Image';
                        }}
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">
                        {product.brand}
                      </p>

                      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex-1" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-lg font-bold text-gray-900">
                          {product.price}
                        </p>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          View
                          <svg
  className="ml-1 w-3 h-3 flex-shrink-0"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  viewBox="0 0 24 24"
  width="12"
  height="12"
>
  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
</svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;