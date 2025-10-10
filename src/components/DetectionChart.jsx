import { useEffect, useState } from "react";
import "./detectionChart.css";

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

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        if (!userId) {
          console.warn("⚠️ No userId found, backend must infer from token");
        }

        const url = userId
          ? `http://localhost:5000/api/detections/history?userId=${userId}`
          : `http://localhost:5000/api/detections/history`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const latest = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : data;

        if (!latest) {
          setError("No detection data found");
          setLoading(false);
          return;
        }

        processChartData([latest]);
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
      '#5eb8b8', '#7ec8c8', '#4a9999', '#96d4d4', 
      '#6fcfcf', '#3d8888', '#88dbdb', '#2d7777'
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
      colors: colors.slice(0, Object.keys(confidenceStats).length)
    });

    const sortedDates = Object.keys(timeline).sort((a, b) => new Date(a) - new Date(b));
    setTimelineData({
      labels: sortedDates,
      data: sortedDates.map(date => timeline[date]),
    });
  };

  // Bar chart component
  const CSSBarChart = ({ data, title }) => {
    if (!data) return null;
    
    const maxValue = Math.max(...data.data);
    
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="bar-chart-wrapper">
          {data.labels.map((label, index) => {
            const value = data.data[index];
            const heightPercent = (value / maxValue) * 100;
            const color = data.colors[index];
            
            return (
              <div key={label} className="bar-item">
                <div className="bar-value">{value}</div>
                <div
                  className="bar-column"
                  style={{
                    backgroundColor: color,
                    height: `${heightPercent}%`,
                  }}
                />
                <div className="bar-label">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Pie chart component (FIXED)
  const CSSPieChart = ({ data, title }) => {
    if (!data) return null;
    
    const total = data.data.reduce((a, b) => a + b, 0);
    
    // Create segments for the pie chart
    const segments = data.labels.map((label, index) => {
      const value = data.data[index];
      const percentage = (value / total) * 100;
      return {
        label,
        value,
        percentage: percentage.toFixed(1),
        color: data.colors[index]
      };
    });
    
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="pie-chart-wrapper">
          <div className="pie-chart">
            {segments.map((segment, index) => {
              // Calculate the rotation for each segment
              const previousTotal = segments.slice(0, index).reduce((sum, s) => sum + parseFloat(s.percentage), 0);
              const rotation = (previousTotal / 100) * 360;
              const segmentDegrees = (parseFloat(segment.percentage) / 100) * 360;
              
              return (
                <div
                  key={segment.label}
                  className="pie-segment"
                  style={{
                    '--rotation': `${rotation}deg`,
                    '--segment-degrees': `${segmentDegrees}deg`,
                    '--segment-color': segment.color
                  }}
                />
              );
            })}
          </div>
          <div className="pie-legend">
            {segments.map((segment) => (
              <div key={segment.label} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="legend-text">
                  {segment.label}: {segment.value} ({segment.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Line chart component (FIXED)
  const CSSLineChart = ({ data, title }) => {
    if (!data || !data.data || data.data.length === 0) return null;
    
    const maxValue = Math.max(...data.data);
    const minValue = Math.min(...data.data);
    const range = maxValue - minValue || 1;
    
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="line-chart-wrapper">
          <svg viewBox="0 0 400 200" className="line-chart-svg">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                className="grid-line"
              />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#5eb8b8"
              strokeWidth="3"
              points={data.data.map((value, index) => {
                const x = (index / (data.data.length - 1)) * 380 + 10;
                const y = 180 - ((value - minValue) / range) * 160;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {data.data.map((value, index) => {
              const x = (index / (data.data.length - 1)) * 380 + 10;
              const y = 180 - ((value - minValue) / range) * 160;
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#5eb8b8"
                    className="data-point"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    className="data-label"
                    textAnchor="middle"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="timeline-labels">
            {data.labels.map((label, index) => (
              <span key={index} className="timeline-label">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="detection-chart-loading">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading charts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detection-chart-error">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="detection-chart-warning">
        <p className="warning-text">No detection data available</p>
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
    <div className="detection-chart-container">
      <div className="chart-header">
        <h2 className="dashboard-title">Detection Analytics Dashboard</h2>
        
        <div className="chart-buttons">
          {[
            { key: 'bar', label: 'Bar Chart', icon: '📊' },
            { key: 'pie', label: 'Pie Chart', icon: '🥧' },
            { key: 'timeline', label: 'Timeline', icon: '📈' },
            { key: 'confidence', label: 'Confidence', icon: '🎯' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`chart-button ${activeChart === key ? 'active' : ''}`}
            >
              <span className="button-icon">{icon}</span>
              <span className="button-label">{label}</span>
            </button>
          ))}
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-total">
            <h3 className="stat-title">Total Detections</h3>
            <p className="stat-value">{chartData.totalCount}</p>
          </div>
          <div className="stat-card stat-types">
            <h3 className="stat-title">Detection Types</h3>
            <p className="stat-value">{chartData.labels.length}</p>
          </div>
          <div className="stat-card stat-common">
            <h3 className="stat-title">Most Common</h3>
            <p className="stat-value">
              {chartData.labels[chartData.data.indexOf(Math.max(...chartData.data))]}
            </p>
          </div>
        </div>
      </div>

      <div className="chart-display">
        {renderChart()}
      </div>

      <div className="summary-section">
        <h3 className="summary-title">Detection Summary</h3>
        <div className="table-wrapper">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Detection Type</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {chartData.labels.map((label, index) => {
                const count = chartData.data[index];
                const total = chartData.totalCount;
                const percentage = ((count / total) * 100).toFixed(1);
                const color = chartData.colors[index];
                
                return (
                  <tr key={label}>
                    <td className="td-label">{label}</td>
                    <td>{count}</td>
                    <td>{percentage}%</td>
                    <td>
                      <div 
                        className="color-box"
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