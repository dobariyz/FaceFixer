import { useEffect, useState } from "react";
import "./detectionChart.css";

const DetectionChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        });
      }
    });

    if (Object.keys(counts).length === 0) {
      setError("No valid detection data found");
      return;
    }

    const colors = [
      '#5eb8b8', '#ff6b9d', '#ffa94d', '#9775fa',
      '#4a9999', '#f06595', '#ff922b', '#845ef7'
    ];

    const totalDetections = Object.values(counts).reduce((a, b) => a + b, 0);

    setChartData({
      labels: Object.keys(counts),
      data: Object.values(counts),
      colors: colors.slice(0, Object.keys(counts).length),
      totalCount: totalDetections
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

  // Pie chart component
  const CSSPieChart = ({ data, title }) => {
    if (!data) return null;
    
    const total = data.data.reduce((a, b) => a + b, 0);
    
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

  if (loading) {
    return (
      <div className="detection-chart-loading">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading your skin analysis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detection-chart-error">
        <div className="error-icon">⚠️</div>
        <p className="error-text">{error}</p>
        <p className="error-hint">Please upload a photo first to see your analysis</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="detection-chart-warning">
        <div className="warning-icon">📊</div>
        <p className="warning-text">No detection data available</p>
        <p className="warning-hint">Upload a photo to see your personalized skin analysis</p>
      </div>
    );
  }

  return (
    <div className="detection-chart-container">
      <div className="chart-header">
        <h2 className="dashboard-title">Your Skin Analysis Dashboard</h2>
        <p className="dashboard-subtitle">Visual breakdown of detected skin concerns</p>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3 className="stat-title">Total Detections</h3>
              <p className="stat-value">{chartData.totalCount}</p>
            </div>
          </div>
          <div className="stat-card stat-types">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <h3 className="stat-title">Concern Types</h3>
              <p className="stat-value">{chartData.labels.length}</p>
            </div>
          </div>
          <div className="stat-card stat-common">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3 className="stat-title">Primary Concern</h3>
              <p className="stat-value">
                {chartData.labels[chartData.data.indexOf(Math.max(...chartData.data))]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <CSSBarChart data={chartData} title="Detection Count" />
        </div>
        <div className="chart-card">
          <CSSPieChart data={chartData} title="Distribution Breakdown" />
        </div>
      </div>

      {/* Summary Table */}
      <div className="summary-section">
        <h3 className="summary-title">
          <span className="title-icon">📋</span>
          Detailed Summary
        </h3>
        <div className="table-wrapper">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Skin Concern</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {chartData.labels.map((label, index) => {
                const count = chartData.data[index];
                const total = chartData.totalCount;
                const percentage = ((count / total) * 100).toFixed(1);
                const color = chartData.colors[index];
                
                // Calculate severity level
                let severity = "Low";
                if (percentage > 40) severity = "High";
                else if (percentage > 20) severity = "Medium";
                
                return (
                  <tr key={label}>
                    <td className="td-label">
                      <div className="label-with-color">
                        <div 
                          className="color-indicator"
                          style={{ backgroundColor: color }}
                        />
                        {label}
                      </div>
                    </td>
                    <td className="td-count">{count}</td>
                    <td className="td-percentage">{percentage}%</td>
                    <td>
                      <span className={`severity-badge severity-${severity.toLowerCase()}`}>
                        {severity}
                      </span>
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