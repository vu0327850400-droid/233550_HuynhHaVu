const express = require("express");
const mongoose = require("mongoose");
const Device = require("../models/Device");

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const handleError = (err, res) => {
  if (err.code === 11000) return res.status(409).json({ message: "Mã thiết bị đã tồn tại" });
  if (err.name === "ValidationError") {
    const msg = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message: msg });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  console.error(err);
  return res.status(500).json({ message: "Lỗi máy chủ hoặc lỗi kết nối cơ sở dữ liệu" });
};

const checkId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }
  next();
};

// GET /api/devices  và  GET /api/devices?search=...
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const rg = new RegExp(escapeRegex(search.trim()), "i");
      filter = { $or: [{ deviceId: rg }, { name: rg }, { deviceType: rg }, { room: rg }] };
    }
    const devices = await Device.find(filter).sort({ createdAt: -1 });
    res.json(devices);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/devices/:id
router.get("/:id", checkId, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json(device);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/devices
router.post("/", async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (err) {
    handleError(err, res);
  }
});

// PUT /api/devices/:id
router.put("/:id", checkId, async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json(device);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE /api/devices/:id
router.delete("/:id", checkId, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json({ message: "Đã xóa thiết bị" });
  } catch (err) {
    handleError(err, res);
  }
});

module.exports = router;