import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for demo purposes (usually would be Firestore)
  let serverInvoices = [
    { id: 'INV-001', amount: 49.00, date: '2026-04-15', status: 'Paid', plan: 'Pro' },
    { id: 'INV-002', amount: 49.00, date: '2026-03-15', status: 'Paid', plan: 'Pro' },
    { id: 'INV-003', amount: 49.00, date: '2026-02-15', status: 'Paid', plan: 'Pro' },
  ];

  let sentAlerts: any[] = [];

  // Mock user list for Admin panel - made dynamic for demo
  let mockUsers = [
    { uid: 'u1', name: 'Alice Smith', email: 'alice@example.com', plan: 'Pro', status: 'Paid', joined: '2024-01-10', expiryDate: '2026-06-10', history: [] },
    { uid: 'u2', name: 'Bob Johnson', email: 'bob@example.com', plan: 'Basic', status: 'Paid', joined: '2024-02-05', expiryDate: '2026-05-15', history: [] },
    { uid: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', plan: 'Enterprise', status: 'Paid', joined: '2024-03-12', expiryDate: '2027-03-12', history: [] },
    { uid: 'u4', name: 'Diana Prince', email: 'diana@example.com', plan: 'Pro', status: 'Expired', joined: '2024-01-20', expiryDate: '2026-04-20', history: [] },
    { uid: 'u5', name: 'Ethan Hunt', email: 'ethan@example.com', plan: 'Basic', status: 'Paid', joined: '2024-04-01', expiryDate: '2026-08-01', history: [] },
  ];

  // API Routes
  app.post("/api/admin/register-session", (req, res) => {
    const { uid, name, email, plan, status, joined } = req.body;
    
    // Explicitly block restricted admin from being registered in user list/history
    if (email === 'rohith@gmail.com') {
      return res.json({ success: true, ignored: true });
    }
    
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ip: req.ip || '127.0.0.1',
      location: 'Local Preview',
      device: req.headers['user-agent'] || 'Browser',
      status: 'Success'
    };

    // Check if user already exists
    const existingIndex = mockUsers.findIndex(u => u.uid === uid);
    if (existingIndex >= 0) {
      mockUsers[existingIndex] = { 
        ...mockUsers[existingIndex], 
        name, 
        email, 
        plan, 
        status,
        history: [newLog, ...(mockUsers[existingIndex].history || []).slice(0, 4)]
      };
    } else {
      mockUsers.unshift({ 
        uid, 
        name, 
        email, 
        plan, 
        status, 
        joined: joined || new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        history: [newLog]
      });
    }
    
    res.json({ success: true });
  });

  app.post("/api/admin/send-alert", (req, res) => {
    const { uid, message } = req.body;
    const alert = {
      id: Math.random().toString(36).substr(2, 9),
      uid,
      message,
      timestamp: new Date().toISOString()
    };
    sentAlerts.unshift(alert);
    console.log(`[ALERT SENT] User: ${uid}, Message: ${message}`);
    res.json({ success: true, alert });
  });

  app.post("/api/admin/suspend", (req, res) => {
    const { uid } = req.body;
    const userIndex = mockUsers.findIndex(u => u.uid === uid);
    if (userIndex >= 0) {
      mockUsers[userIndex].status = 'Suspended';
      console.log(`[USER SUSPENDED] uid: ${uid}`);
      res.json({ success: true, user: mockUsers[userIndex] });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  });

  app.post("/api/admin/reset", (req, res) => {
    const { uid } = req.body;
    console.log(`[CREDENTIAL RESET] Requested for user: ${uid}`);
    res.json({ success: true });
  });

  app.get("/api/dashboard", (req, res) => {
    res.json({
      analytics: [
        { name: 'Nov', revenue: 12400, users: 420 },
        { name: 'Dec', revenue: 15600, users: 510 },
        { name: 'Jan', revenue: 18900, users: 680 },
        { name: 'Feb', revenue: 21500, users: 740 },
        { name: 'Mar', revenue: 23800, users: 812 },
        { name: 'Apr', revenue: 24560, users: 842 },
      ],
      invoices: serverInvoices
    });
  });

  app.get("/api/admin/stats", (req, res) => {
    // Filter out restricted admin email from visibility
    const visibleUsers = mockUsers.filter(u => u.email !== 'rohith@gmail.com');

    const planIncome = {
      Basic: visibleUsers.filter(u => u.plan === 'Basic' && u.status === 'Paid').length * 19,
      Pro: visibleUsers.filter(u => u.plan === 'Pro' && u.status === 'Paid').length * 49,
      Enterprise: visibleUsers.filter(u => u.plan === 'Enterprise' && u.status === 'Paid').length * 199,
    };

    res.json({
      totalUsers: visibleUsers.length,
      activeLogins: 42, // Simulated active sessions
      users: visibleUsers,
      planIncome,
      totalRevenue: Object.values(planIncome).reduce((a, b) => a + b, 0)
    });
  });

  app.post("/api/renew", (req, res) => {
    const { plan, price } = req.body;
    
    // Simulate server-side invoice generation
    const newInvoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: price || 49.00,
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      plan: plan || 'Basic'
    };

    serverInvoices = [newInvoice, ...serverInvoices];
    
    res.json({
      success: true,
      newInvoice,
      nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
