import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STATUSES = ["Đang sử dụng", "Hư hỏng", "Đang sửa chữa", "Ngừng sử dụng"];
const EMPTY = {
  deviceId: "", name: "", deviceType: "", room: "", brand: "",
  model: "", quantity: 1, status: STATUSES[0], purchaseDate: "", description: "",
};

const statusClass = (s) =>
  ({ "Đang sử dụng": "ok", "Hư hỏng": "bad", "Đang sửa chữa": "fix", "Ngừng sử dụng": "off" }[s] || "");

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async (keyword = "") => {
    setLoading(true);
    setError("");
    try {
      setDevices(await request(`/api/devices?search=${encodeURIComponent(keyword)}`));
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Không kết nối được máy chủ" : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(""); }, []);

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (d) => {
    setForm({ ...d, purchaseDate: d.purchaseDate ? d.purchaseDate.slice(0, 10) : "" });
    setEditingId(d._id);
    setShowForm(true);
    setError("");
  };

  const openDetail = async (id) => {
    try {
      setDetail(await request(`/api/devices/${id}`));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = JSON.stringify({ ...form, quantity: Number(form.quantity) });
      if (editingId) {
        await request(`/api/devices/${editingId}`, { method: "PUT", body });
        notify("Cập nhật thiết bị thành công");
      } else {
        await request("/api/devices", { method: "POST", body });
        notify("Thêm thiết bị thành công");
      }
      setShowForm(false);
      load(search);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Xóa thiết bị ${d.name}?`)) return;
    try {
      await request(`/api/devices/${d._id}`, { method: "DELETE" });
      notify("Đã xóa thiết bị");
      load(search);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container">
      <h1>Quản lý thiết bị phòng học</h1>

      {message && <div className="alert success">{message}</div>}
      {error && !showForm && <div className="alert error">{error}</div>}

      <div className="toolbar">
        <input
          placeholder="Tìm theo mã, tên, loại, phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
        />
        <button onClick={() => load(search)}>Tìm kiếm</button>
        <button onClick={() => { setSearch(""); load(""); }}>Làm mới</button>
        <button className="primary" onClick={openAdd}>+ Thêm thiết bị</button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mã</th><th>Tên</th><th>Loại</th><th>Phòng</th>
              <th>Số lượng</th><th>Tình trạng</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 && (
              <tr><td colSpan="7">Không có thiết bị nào</td></tr>
            )}
            {devices.map((d) => (
              <tr key={d._id}>
                <td>{d.deviceId}</td>
                <td>{d.name}</td>
                <td>{d.deviceType}</td>
                <td>{d.room}</td>
                <td>{d.quantity}</td>
                <td><span className={`badge ${statusClass(d.status)}`}>{d.status}</span></td>
                <td>
                  <button onClick={() => openDetail(d._id)}>Xem</button>
                  <button onClick={() => openEdit(d)}>Sửa</button>
                  <button className="danger" onClick={() => handleDelete(d)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal">
          <form className="box" onSubmit={handleSubmit}>
            <h2>{editingId ? "Cập nhật thiết bị" : "Thêm thiết bị"}</h2>
            {error && <div className="alert error">{error}</div>}
            <input name="deviceId" placeholder="Mã thiết bị *" value={form.deviceId} onChange={handleChange} required />
            <input name="name" placeholder="Tên thiết bị *" value={form.name} onChange={handleChange} required />
            <input name="deviceType" placeholder="Loại thiết bị *" value={form.deviceType} onChange={handleChange} required />
            <input name="room" placeholder="Phòng học *" value={form.room} onChange={handleChange} required />
            <input name="brand" placeholder="Hãng sản xuất" value={form.brand} onChange={handleChange} />
            <input name="model" placeholder="Model" value={form.model} onChange={handleChange} />
            <input name="quantity" type="number" min="0" placeholder="Số lượng *" value={form.quantity} onChange={handleChange} required />
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} />
            <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} />
            <div className="actions">
              <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="primary" type="submit">Lưu</button>
            </div>
          </form>
        </div>
      )}

      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết thiết bị</h2>
            <p><b>Mã:</b> {detail.deviceId}</p>
            <p><b>Tên:</b> {detail.name}</p>
            <p><b>Loại:</b> {detail.deviceType}</p>
            <p><b>Phòng:</b> {detail.room}</p>
            <p><b>Hãng:</b> {detail.brand}</p>
            <p><b>Model:</b> {detail.model}</p>
            <p><b>Số lượng:</b> {detail.quantity}</p>
            <p><b>Tình trạng:</b> <span className={`badge ${statusClass(detail.status)}`}>{detail.status}</span></p>
            <p><b>Ngày mua:</b> {detail.purchaseDate ? new Date(detail.purchaseDate).toLocaleDateString("vi-VN") : "-"}</p>
            <p><b>Mô tả:</b> {detail.description}</p>
            <div className="actions"><button onClick={() => setDetail(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </div>
  );
}