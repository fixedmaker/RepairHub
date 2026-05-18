import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Users
  app.get("/api/users", (req, res) => {
    res.json(users.map(({ password, ...u }) => u));
  });

  app.post("/api/users", (req, res) => {
    const newUser = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    users.push(newUser);
    res.json(newUser);
  });

  app.delete("/api/users/:id", (req, res) => {
    users = users.filter(u => u.id !== req.params.id);
    res.json({ success: true });
  });

  // Customers
  app.get("/api/customers", (req, res) => res.json(customers));
  app.post("/api/customers", (req, res) => {
    const newCustomer = { ...req.body, id: "c" + Math.random().toString(36).substr(2, 5) };
    customers.push(newCustomer);
    res.json(newCustomer);
  });

  // Devices
  app.get("/api/devices", (req, res) => res.json(devices));
  app.post("/api/devices", (req, res) => {
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

  app.patch("/api/devices/:id", (req, res) => {
    const index = devices.findIndex(d => d.id === req.params.id);
    if (index !== -1) {
      devices[index] = { ...devices[index], ...req.body, updatedAt: new Date().toISOString() };
      
      // If status changed, add a log
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
  app.get("/api/devices/:id/logs", (req, res) => {
    res.json(logs.filter(l => l.deviceId === req.params.id));
  });

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
