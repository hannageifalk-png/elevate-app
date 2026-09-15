import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    message: "Elevate API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
