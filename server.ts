import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";

// Lazy-initialized Supabase Client
let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing!");
      // We don't throw here to avoid crashing the whole server process immediately, 
      // but the getSupabase() call will fail when used.
      return null;
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase Client initialized successfully");
  }
  return supabaseClient;
}

function ensureSupabase() {
  const client = getSupabase();
  if (!client) {
    throw new Error("Supabase is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment/secrets.");
  }
  return client;
}

// Request logging middleware
app.use((req, res, next) => {
  if (req.url !== '/api/health') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

const apiRouter = express.Router();

// --- API ROUTES ---
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth
apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = ensureSupabase();
    
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err: any) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Users
apiRouter.get("/users", async (req, res) => {
  try {
    const { data: users, error } = await ensureSupabase().from("users").select("*");
    if (error) throw error;
    res.json(users.map(({ password: _, ...u }: any) => u));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/users", async (req, res) => {
  try {
    const { data: user, error } = await ensureSupabase()
      .from("users")
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/users/:id", async (req, res) => {
  try {
    const { error } = await ensureSupabase().from("users").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Customers
apiRouter.get("/customers", async (req, res) => {
  try {
    const { data: customers, error } = await ensureSupabase().from("customers").select("*");
    if (error) throw error;
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/customers", async (req, res) => {
  try {
    const { data: customer, error } = await ensureSupabase()
      .from("customers")
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Devices
apiRouter.get("/devices", async (req, res) => {
  try {
    const { data: devices, error } = await ensureSupabase().from("devices").select("*").order("entryDate", { ascending: false });
    if (error) throw error;
    res.json(devices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/devices", async (req, res) => {
  try {
    const newDeviceData = { 
      ...req.body, 
      entryDate: new Date().toISOString(),
      progress: 0,
      status: "Menunggu",
      documentation: req.body.documentation || []
    };
    const { data: device, error } = await ensureSupabase()
      .from("devices")
      .insert([newDeviceData])
      .select()
      .single();
    if (error) throw error;
    res.json(device);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.patch("/devices/:id", async (req, res) => {
  try {
    const supabase = ensureSupabase();
    const { data: currentDevice, error: fetchError } = await supabase
      .from("devices")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !currentDevice) {
      return res.status(404).json({ message: "Device not found" });
    }

    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    const { data: updatedDevice, error: updateError } = await supabase
      .from("devices")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (req.body.status || req.body.serviceNotes) {
      await supabase.from("logs").insert([{
        deviceId: req.params.id,
        technicianId: req.body.technicianId || currentDevice.technicianId,
        status: req.body.status || currentDevice.status,
        note: req.body.serviceNotes || "Status updated",
        timestamp: new Date().toISOString()
      }]);
    }
    
    res.json(updatedDevice);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Logs
apiRouter.get("/devices/:id/logs", async (req, res) => {
  try {
    const { data: logs, error } = await ensureSupabase()
      .from("logs")
      .select("*")
      .eq("deviceId", req.params.id)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
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
