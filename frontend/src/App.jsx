import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { Battery, HardDrive, RefreshCw, Activity, Zap, Cpu } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const StatCard = ({ label, value, unit, icon: Icon, trend }) => (
  <div className="stat-card animate-fade">
    <div className="stat-label">{label}</div>
    <div className="stat-value">
      {value} <span className="stat-unit">{unit}</span>
      {Icon && <Icon size={24} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
    </div>
  </div>
);

const BatteryDashboard = ({ data }) => {
  const latest = data[data.length - 1]?.battery_data || {};
  const psutil = latest.psutil || {};
  
  const chartData = data.map(d => ({
    time: new Date(d.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    percent: d.battery_data?.psutil?.percent || 0
  }));

  return (
    <div className="animate-fade">
      <div className="stats-grid">
        <StatCard label="Charge Level" value={psutil.percent || 0} unit="%" icon={Zap} />
        <StatCard label="Plugged In" value={psutil.power_plugged ? 'Yes' : 'No'} unit="" icon={Activity} />
        <StatCard label="Health Status" value={latest.wmic?.properties?.Status || 'N/A'} unit="" icon={RefreshCw} />
      </div>
      
      <div className="main-chart-container">
        <div className="chart-header">
          <h2>Battery Level History</h2>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#00f2fe' }}
            />
            <Area type="monotone" dataKey="percent" stroke="#00f2fe" fillOpacity={1} fill="url(#colorPercent)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DiskDashboard = ({ data }) => {
  const latest = data[data.length - 1] || {};
  const usage = latest.disk_usage || {};
  const diskIo = latest.disk_io || {};
  
  const usedGB = (usage.used_bytes / (1024**3)).toFixed(1);
  const totalGB = (usage.total_bytes / (1024**3)).toFixed(1);
  const percent = ((usage.used_bytes / usage.total_bytes) * 100).toFixed(1);

  const chartData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: (d.disk_io?.read_bytes_per_sec / 1024 / 1024) || 0,
    write: (d.disk_io?.write_bytes_per_sec / 1024 / 1024) || 0
  }));

  const topProcesses = (latest.process_writes || [])
    .sort((a, b) => b.write_bytes_delta - a.write_bytes_delta)
    .slice(0, 5);

  return (
    <div className="animate-fade">
      <div className="stats-grid">
        <StatCard label="Storage Used" value={usedGB} unit={`/ ${totalGB} GB`} icon={HardDrive} />
        <StatCard label="Read Speed" value={(diskIo.read_bytes_per_sec / 1024 / 1024).toFixed(2)} unit="MB/s" icon={Activity} />
        <StatCard label="Write Speed" value={(diskIo.write_bytes_per_sec / 1024 / 1024).toFixed(2)} unit="MB/s" icon={RefreshCw} />
      </div>

      <div className="main-chart-container">
        <div className="chart-header">
          <h2>Disk I/O Throughput (MB/s)</h2>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="read" stroke="#00f2fe" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="write" stroke="#4facfe" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="process-list">
        <div className="chart-header" style={{ marginBottom: '1rem' }}>
          <h2>High-Write Processes</h2>
          <Cpu size={20} color="#94a3b8" />
        </div>
        <table className="process-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>PID</th>
              <th>Write Delta</th>
              <th>Load</th>
            </tr>
          </thead>
          <tbody>
            {topProcesses.map((p, i) => (
              <tr key={p.pid + i}>
                <td>{p.process_name}</td>
                <td>{p.pid}</td>
                <td>{(p.write_bytes_delta / 1024).toFixed(1)} KB</td>
                <td>
                  <div className="process-bar-container">
                    <div 
                      className="process-bar" 
                      style={{ width: `${Math.min((p.write_bytes_delta / 100000) * 100, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('battery');
  const [batteryData, setBatteryData] = useState([]);
  const [diskData, setDiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [batRes, diskRes] = await Promise.all([
        fetch(`${API_BASE}/battery?limit=20`),
        fetch(`${API_BASE}/disk?limit=20`)
      ]);
      const batJson = await batRes.json();
      const diskJson = await diskRes.json();
      setBatteryData(batJson.data);
      setDiskData(diskJson.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="title-section">
          <h1>System Insights</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Real-time telemetry dashboard</p>
        </div>
        <nav className="nav-buttons">
          <button 
            className={`nav-btn ${activeTab === 'battery' ? 'active' : ''}`}
            onClick={() => setActiveTab('battery')}
          >
            <Zap size={18} /> Battery
          </button>
          <button 
            className={`nav-btn ${activeTab === 'disk' ? 'active' : ''}`}
            onClick={() => setActiveTab('disk')}
          >
            <HardDrive size={18} /> Disk
          </button>
        </nav>
      </header>

      <main>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <RefreshCw className="animate-spin" size={32} color="#00f2fe" />
          </div>
        ) : (
          activeTab === 'battery' ? (
            <BatteryDashboard data={batteryData} />
          ) : (
            <DiskDashboard data={diskData} />
          )
        )}
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '2rem 0', color: '#475569', fontSize: '0.75rem' }}>
        <p>&copy; 2026 Sleek Analytics. All systems nominal.</p>
      </footer>
    </div>
  );
}

export default App;
