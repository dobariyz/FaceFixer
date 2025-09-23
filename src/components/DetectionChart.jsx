import { useEffect, useState } from "react";

const DetectionChart = () => {
  const [chartData, setChartData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [confidenceData, setConfidenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('bar');

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // 2️⃣ Get userId from stored user object
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      // If userId is not found, stop and show error
      if (!userId) {
        console.warn("⚠️ No userId found, backend must infer from token");
      }

      // 3️⃣ Build URL: if userId exists → send as query param
      const url = userId
        ? `http://localhost:5000/api/detections/history?userId=${userId}`
        : `http://localhost:5000/api/detections/history`;

      // 4️⃣ Call API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }s

      const data = await response.json();

// 🔥 Pick latest based on createdAt
const latest = Array.isArray(data)
  ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
  : data;

if (!latest) {
  setError("No detection data found");
  setLoading(false);
  return;
}

processChartData([latest]); // send only one record

      setLoading(false);
    } catch (err) {
      console.error("Error fetching detection history:", err);
      setError(`Failed to fetch detection history: ${err.message}`);
      setLoading(false);
    }
  };

  fetchHistory();
}, []);

  const processChartData = (data) => {
    const counts = {};
    const confidenceStats = {};
    const timeline = {};
    
    data.forEach(item => {
      if (!item.detections) return;
      
      let parsed;
      try {
        parsed = JSON.parse(item.detections);
      } catch (err) {
        console.error("Error parsing detections JSON:", err);
        return;
      }

      if (parsed.summary) {
        Object.keys(parsed.summary).forEach(cls => {
          const summary = parsed.summary[cls];
          counts[cls] = (counts[cls] || 0) + summary.count;
          
          if (!confidenceStats[cls]) {
            confidenceStats[cls] = {
              total: 0,
              count: 0,
              min: summary.min_conf,
              max: summary.max_conf
            };
          }
          confidenceStats[cls].total += summary.avg_conf * summary.count;
          confidenceStats[cls].count += summary.count;
          confidenceStats[cls].min = Math.min(confidenceStats[cls].min, summary.min_conf);
          confidenceStats[cls].max = Math.max(confidenceStats[cls].max, summary.max_conf);
        });
      }

      const date = new Date(item.createdAt).toLocaleDateString();
      if (!timeline[date]) {
        timeline[date] = 0;
      }
      timeline[date] += Object.values(parsed.summary || {}).reduce((sum, s) => sum + s.count, 0);
    });

    if (Object.keys(counts).length === 0) {
      setError("No valid detection data found");
      return;
    }

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#F39C12', '#E74C3C'
    ];

    const totalDetections = Object.values(counts).reduce((a, b) => a + b, 0);

    setChartData({
      labels: Object.keys(counts),
      data: Object.values(counts),
      colors: colors.slice(0, Object.keys(counts).length),
      totalCount: totalDetections
    });

    const avgConfidences = Object.keys(confidenceStats).map(cls => 
      Math.round((confidenceStats[cls].total / confidenceStats[cls].count) * 100) / 100
    );
    
    setConfidenceData({
      labels: Object.keys(confidenceStats),
      data: avgConfidences,
    });

    const sortedDates = Object.keys(timeline).sort((a, b) => new Date(a) - new Date(b));
    setTimelineData({
      labels: sortedDates,
      data: sortedDates.map(date => timeline[date]),
    });
  };

  // CSS-only bar chart component
  const CSSBarChart = ({ data, title }) => {
    if (!data) return null;
    
    const maxValue = Math.max(...data.data);
    
    return (
      <div className="css-chart">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="flex items-end justify-center space-x-2 h-64 p-4">
          {data.labels.map((label, index) => {
            const value = data.data[index];
            const height = (value / maxValue) * 200;
            const color = data.colors[index];
            
            return (
              <div key={label} className="flex flex-col items-center">
                <div className="text-xs font-medium mb-1">{value}</div>
                <div
                  className="rounded-t-lg flex items-end justify-center text-white text-xs font-bold transition-all duration-300 hover:opacity-80"
                  style={{
                    backgroundColor: color,
                    height: `${height}px`,
                    width: '40px',
                    minHeight: '20px'
                  }}
                />
                <div className="text-xs mt-2 text-center capitalize max-w-12 break-words">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // CSS-only pie chart component
  const CSSPieChart = ({ data, title }) => {
    if (!data) return null;
    
    const total = data.data.reduce((a, b) => a + b, 0);
    let currentAngle = 0;
    
    return (
      <div className="css-chart">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <div className="w-full h-full rounded-full overflow-hidden">
              {data.labels.map((label, index) => {
                const value = data.data[index];
                const percentage = (value / total) * 100;
                const angle = (value / total) * 360;
                
                const slice = (
                  <div
                    key={label}
                    className="absolute inset-0"
                    style={{
                      background: `conic-gradient(from ${currentAngle}deg, ${data.colors[index]} 0deg, ${data.colors[index]} ${angle}deg, transparent ${angle}deg)`,
                      borderRadius: '50%'
                    }}
                  />
                );
                
                currentAngle += angle;
                return slice;
              })}
            </div>
          </div>
          <div className="ml-8">
            {data.labels.map((label, index) => {
              const value = data.data[index];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return (
                <div key={label} className="flex items-center mb-2">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: data.colors[index] }}
                  />
                  <span className="text-sm capitalize">
                    {label}: {value} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Line chart component
  const CSSLineChart = ({ data, title }) => {
    if (!data) return null;
    
    const maxValue = Math.max(...data.data);
    const points = data.data.map((value, index) => {
      const x = (index / (data.data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="css-chart">
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
        <div className="flex justify-center">
          <svg viewBox="0 0 100 100" className="w-96 h-64 border border-gray-300">
            <polyline
              fill="none"
              stroke="#4ECDC4"
              strokeWidth="2"
              points={points}
            />
            {data.data.map((value, index) => {
              const x = (index / (data.data.length - 1)) * 100;
              const y = 100 - (value / maxValue) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#4ECDC4"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between mt-2 px-8">
          {data.labels.map((label, index) => (
            <span key={index} className="text-xs text-gray-600">
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading charts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">No detection data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'bar':
        return <CSSBarChart data={chartData} title="Detection Count by Type" />;
      case 'pie':
        return <CSSPieChart data={chartData} title="Detection Distribution" />;
      case 'timeline':
        return <CSSLineChart data={timelineData} title="Detections Over Time" />;
      case 'confidence':
        return <CSSBarChart data={confidenceData} title="Average Confidence by Type" />;
      default:
        return <CSSBarChart data={chartData} title="Detection Count by Type" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Detection Analytics Dashboard</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'bar', label: 'Bar Chart', icon: '📊' },
            { key: 'pie', label: 'Pie Chart', icon: '🥧' },
            { key: 'timeline', label: 'Timeline', icon: '📈' },
            { key: 'confidence', label: 'Confidence', icon: '🎯' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChart === key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-600">Total Detections</h3>
            <p className="text-2xl font-bold text-blue-800">
              {chartData.totalCount}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-600">Detection Types</h3>
            <p className="text-2xl font-bold text-green-800">{chartData.labels.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-600">Most Common</h3>
            <p className="text-lg font-bold text-purple-800 capitalize">
              {chartData.labels[chartData.data.indexOf(Math.max(...chartData.data))]}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        {renderChart()}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Detection Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Detection Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Count</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Percentage</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Color</th>
              </tr>
            </thead>
            <tbody>
              {chartData.labels.map((label, index) => {
                const count = chartData.data[index];
                const total = chartData.totalCount;
                const percentage = ((count / total) * 100).toFixed(1);
                const color = chartData.colors[index];
                
                return (
                  <tr key={label} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-800 capitalize">{label}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{count}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{percentage}%</td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      <div 
                        className="w-6 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      ></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetectionChart;