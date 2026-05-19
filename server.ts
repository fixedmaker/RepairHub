import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.url !== '/api/health') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// --- MOCK DATABASE ---
let users = [
  { id: "1", name: "Admin User", email: "admin@repairhub.com", password: "admin123", role: "admin" },
  { id: "2", name: "Tech John", email: "tech@repairhub.com", password: "tech123", role: "technician" }
];

let customers = [
  { id: "c1", name: "Budi Santoso", phone: "08123456789", email: "budi@gmail.com", address: "Jakarta" },
  { id: "c2", name: "Siti Aminah", phone: "08987654321", email: "siti@gmail.com", address: "Bandung" }
];

let devices = [
  { 
    id: "d1", 
    customerId: "c1", 
    customerName: "Budi Santoso",
    type: "Laptop", 
    brand: "Asus", 
    model: "ROG Strix", 
    serialNumber: "SN123456", 
    damageDescription: "Mati total setelah kena air",
    status: "Diproses", 
    technicianId: "2",
    technicianName: "Tech John",
    entryDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    progress: 60,
    serviceNotes: "Sedang menunggu sparepart IC Power",
    documentation: []
  },
  { 
    id: "d2", 
    customerId: "c2", 
    customerName: "Siti Aminah",
    type: "Smartphone", 
    brand: "Samsung", 
    model: "S23 Ultra", 
    serialNumber: "SN987654", 
    damageDescription: "Layar pecah",
    status: "Menunggu", 
    entryDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    progress: 0,
    serviceNotes: "",
    documentation: []
  }
];

let logs = [
  { id: "l1", deviceId: "d1", technicianId: "2", status: "Diproses", note: "Unit dibongkar, ditemukan korosi pada IC Power", timestamp: new Date(Date.now() - 86400000).toISOString() }
];

const apiRouter = express.Router();

// --- API ROUTES ---
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth
apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } else {
    res.status(401).json({ message: "Email atau password salah." });
  }
});

// Users
apiRouter.get("/users", (req, res) => {
  res.json(users.map(({ password: _, ...u }) => u));
});

apiRouter.post("/users", (req, res) => {
  const newUser = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
  users.push(newUser);
  res.json(newUser);
});

apiRouter.delete("/users/:id", (req, res) => {
  users = users.filter(u => u.id !== req.params.id);
  res.json({ success: true });
});

// Customers
apiRouter.get("/customers", (req, res) => res.json(customers));
apiRouter.post("/customers", (req, res) => {
  const newCustomer = { ...req.body, id: "c" + Math.random().toString(36).substr(2, 5) };
  customers.push(newCustomer);
  res.json(newCustomer);
});

// Devices
apiRouter.get("/devices", (req, res) => res.json(devices));
apiRouter.post("/devices", (req, res) => {
  const newDevice = { 
    ...req.body, 
    id: "d" + Math.random().toString(36).substr(2, 5),
    entryDate: new Date().toISOString(),
    progress: 0,
    status: "Menunggu"
  };
  devices.push(newDevice);
  res.json(newDevice);
});

apiRouter.patch("/devices/:id", (req, res) => {
  const index = devices.findIndex(d => d.id === req.params.id);
  if (index !== -1) {
    devices[index] = { ...devices[index], ...req.body, updatedAt: new Date().toISOString() };
    
    if (req.body.status || req.body.serviceNotes) {
      logs.push({
        id: "l" + Math.random().toString(36).substr(2, 5),
        deviceId: req.params.id,
        technicianId: req.body.technicianId || devices[index].technicianId,
        status: req.body.status || devices[index].status,
        note: req.body.serviceNotes || "Status updated",
        timestamp: new Date().toISOString()
      });
    }
    
    res.json(devices[index]);
  } else {
    res.status(404).json({ message: "Device not found" });
  }
});

// Logs
apiRouter.get("/devices/:id/logs", (req, res) => {
  res.json(logs.filter(l => l.deviceId === req.params.id));
});

app.use("/api", apiRouter);

async function startServer() {
  try {
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Only start the server if not being imported (Vercel imports it)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
