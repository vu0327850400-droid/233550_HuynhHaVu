require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const devicesRouter = require("./routes/devices");

const app = express();
const PORT = process.env.PORT || 5000;

const origins = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());
app.use(cors({ origin: origins.includes("*") ? "*" : origins }));
app.use(express.json());

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", database: dbState, time: new Date().toISOString() });
});

app.use("/api/devices", devicesRouter);

app.use((req, res) => res.status(404).json({ message: "Endpoint không tồn tại" }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Đã kết nối MongoDB Atlas");
    app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  });