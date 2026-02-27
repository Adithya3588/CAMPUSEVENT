// Campus Event Hub - Express Backend Server
const express = require("express");
const cors = require("cors");
const { initializeFirebase } = require("./config/firebase");

// Initialize Firebase Admin
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 3001;

// Activity log storage (in-memory)
const activityLog = [];
const MAX_LOGS = 100;

const addActivity = (method, path, status, duration, userAgent) => {
  activityLog.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    duration: `${duration}ms`,
    userAgent: userAgent || "Unknown",
  });
  // Keep only last MAX_LOGS entries
  if (activityLog.length > MAX_LOGS) {
    activityLog.pop();
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware with activity tracking
app.use((req, res, next) => {
  const start = Date.now();
  const userAgent = req.headers["user-agent"];
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    addActivity(req.method, req.path, res.statusCode, duration, userAgent);
  });
  
  next();
});

// Routes
const eventsRouter = require("./routes/events");
const registrationsRouter = require("./routes/registrations");

app.use("/api/events", eventsRouter);
app.use("/api/registrations", registrationsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Campus Event Hub API is running",
    timestamp: new Date().toISOString()
  });
});

// Activity log API endpoint
app.get("/api/activity", (req, res) => {
  res.json({
    total: activityLog.length,
    logs: activityLog,
  });
});

// Activity Dashboard HTML Page
app.get("/dashboard", (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus Event Hub - Backend Activity Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #e4e4e7;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #374151;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #9ca3af;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 20px;
    }
    .stat-card h3 { font-size: 12px; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; }
    .stat-card .value { font-size: 32px; font-weight: 700; color: #60a5fa; }
    .activity-section {
      background: rgba(255,255,255,0.05);
      border: 1px solid #374151;
      border-radius: 12px;
      overflow: hidden;
    }
    .section-header {
      padding: 16px 20px;
      border-bottom: 1px solid #374151;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-header h2 { font-size: 16px; font-weight: 600; }
    .refresh-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .refresh-btn:hover { background: #2563eb; }
    .activity-list { max-height: 500px; overflow-y: auto; }
    .activity-item {
      display: grid;
      grid-template-columns: 80px 70px 1fr 80px 100px;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid #374151;
      font-size: 13px;
      align-items: center;
    }
    .activity-item:hover { background: rgba(255,255,255,0.03); }
    .method {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
      text-align: center;
    }
    .method.GET { background: #22c55e20; color: #22c55e; }
    .method.POST { background: #3b82f620; color: #3b82f6; }
    .method.PUT { background: #f59e0b20; color: #f59e0b; }
    .method.DELETE { background: #ef444420; color: #ef4444; }
    .status-code { font-weight: 600; }
    .status-code.success { color: #22c55e; }
    .status-code.error { color: #ef4444; }
    .path { color: #e4e4e7; font-family: monospace; }
    .duration { color: #9ca3af; }
    .timestamp { color: #6b7280; font-size: 12px; }
    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: #6b7280;
    }
    .auto-refresh { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9ca3af; }
    .auto-refresh input { accent-color: #3b82f6; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎓 Campus Event Hub - Backend Dashboard</h1>
      <div class="status">
        <div class="status-dot"></div>
        <span>Server Running</span>
      </div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Requests</h3>
        <div class="value" id="totalRequests">0</div>
      </div>
      <div class="stat-card">
        <h3>GET Requests</h3>
        <div class="value" id="getRequests">0</div>
      </div>
      <div class="stat-card">
        <h3>POST Requests</h3>
        <div class="value" id="postRequests">0</div>
      </div>
      <div class="stat-card">
        <h3>Error Responses</h3>
        <div class="value" id="errorResponses">0</div>
      </div>
    </div>

    <div class="activity-section">
      <div class="section-header">
        <h2>📋 Recent Activity</h2>
        <div style="display: flex; gap: 12px; align-items: center;">
          <label class="auto-refresh">
            <input type="checkbox" id="autoRefresh" checked>
            Auto-refresh (5s)
          </label>
          <button class="refresh-btn" onclick="fetchActivity()">↻ Refresh</button>
        </div>
      </div>
      <div class="activity-list" id="activityList">
        <div class="empty-state">Loading activity...</div>
      </div>
    </div>
  </div>

  <script>
    let autoRefreshInterval;

    async function fetchActivity() {
      try {
        const response = await fetch('/api/activity');
        const data = await response.json();
        renderActivity(data);
        updateStats(data.logs);
      } catch (error) {
        document.getElementById('activityList').innerHTML = 
          '<div class="empty-state">Failed to fetch activity</div>';
      }
    }

    function renderActivity(data) {
      const list = document.getElementById('activityList');
      if (!data.logs || data.logs.length === 0) {
        list.innerHTML = '<div class="empty-state">No activity recorded yet</div>';
        return;
      }

      list.innerHTML = data.logs.map(log => \`
        <div class="activity-item">
          <span class="method \${log.method}">\${log.method}</span>
          <span class="status-code \${log.status < 400 ? 'success' : 'error'}">\${log.status}</span>
          <span class="path">\${log.path}</span>
          <span class="duration">\${log.duration}</span>
          <span class="timestamp">\${new Date(log.timestamp).toLocaleTimeString()}</span>
        </div>
      \`).join('');
    }

    function updateStats(logs) {
      document.getElementById('totalRequests').textContent = logs.length;
      document.getElementById('getRequests').textContent = logs.filter(l => l.method === 'GET').length;
      document.getElementById('postRequests').textContent = logs.filter(l => l.method === 'POST').length;
      document.getElementById('errorResponses').textContent = logs.filter(l => l.status >= 400).length;
    }

    function toggleAutoRefresh() {
      const checkbox = document.getElementById('autoRefresh');
      if (checkbox.checked) {
        autoRefreshInterval = setInterval(fetchActivity, 5000);
      } else {
        clearInterval(autoRefreshInterval);
      }
    }

    document.getElementById('autoRefresh').addEventListener('change', toggleAutoRefresh);
    
    // Initial fetch
    fetchActivity();
    toggleAutoRefresh();
  </script>
</body>
</html>
  `;
  res.type('html').send(html);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Campus Event Hub API",
    version: "1.0.0",
    endpoints: {
      dashboard: "/dashboard",
      health: "/api/health",
      activity: "/api/activity",
      events: "/api/events",
      registrations: "/api/registrations",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Campus Event Hub - Backend Server                  ║
╠════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                   ║
║  Dashboard:        http://localhost:${PORT}/dashboard         ║
║                                                            ║
║  API Endpoints:                                            ║
║  • GET    /api/health           - Health check             ║
║  • GET    /api/events           - Get all events           ║
║  • GET    /api/events/:id       - Get event by ID          ║
║  • POST   /api/events           - Create event             ║
║  • PUT    /api/events/:id       - Update event             ║
║  • DELETE /api/events/:id       - Delete event             ║
║  • GET    /api/activity         - Activity logs            ║
║  • GET    /api/registrations/my - Get my registrations     ║
║  • POST   /api/registrations    - Register for event       ║
║  • DELETE /api/registrations/:id - Unregister              ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
