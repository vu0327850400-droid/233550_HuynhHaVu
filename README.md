# Hệ thống quản lý thiết bị phòng học

Sinh viên: Huỳnh Hà Vũ - MSSV: 233550

## Mô tả đề tài
Ứng dụng quản lý thiết bị phòng học: xem, tìm kiếm, thêm, cập nhật, xóa thiết bị và theo dõi tình trạng sử dụng.

## Công nghệ sử dụng
React (Vite), Node.js, Express, MongoDB Atlas, Docker, Docker Hub, Render, Git/GitHub.

## Cấu trúc dự án
```
233550_HuynhHaVu/
├── backend/    # Express API
├── frontend/   # React app
├── .gitignore
└── README.md
```

## Cơ sở dữ liệu
- Database: `233550_HuynhHaVu`
- Collection: `devices`
- Các trường: deviceId, name, deviceType, room, brand, model, quantity, status, purchaseDate, description
- Trạng thái (status): Đang sử dụng, Hư hỏng, Đang sửa chữa, Ngừng sử dụng

## Hướng dẫn cài đặt và chạy

### Backend
```
cd backend
npm install
```
Tạo file `backend/.env` theo mẫu `backend/.env.example`:
```
MONGODB_URI=<chuỗi kết nối MongoDB Atlas>
PORT=5000
```
Chạy:
```
npm run dev
```
Kiểm tra: http://localhost:5000/health

### Frontend
```
cd frontend
npm install
```
Tạo file `frontend/.env` theo mẫu `frontend/.env.example`:
```
VITE_API_URL=http://localhost:5000
```
Chạy:
```
npm run dev
```
Mở: http://localhost:5173

### Chạy backend bằng Docker
Image trên Docker Hub: https://hub.docker.com/r/havu2005/backend

Build image:
```
docker build -t havu2005/backend ./backend
```
Chạy container (tạo file `backend/.env` từ `backend/.env.example` trước):
```
docker run -d --name backend-test -p 5000:5000 --env-file backend/.env havu2005/backend
```
Kiểm tra:
- http://localhost:5000/health
- http://localhost:5000/api/devices

Lưu ý: file `.env` không được đưa vào image, thông tin kết nối MongoDB được truyền khi chạy container.


### Chạy frontend bằng Docker
Image trên Docker Hub: https://hub.docker.com/r/havu2005/frontend

Build image (địa chỉ backend được gắn vào lúc build):
```
docker build -t havu2005/frontend --build-arg VITE_API_URL=http://localhost:5000 ./frontend
```
Chạy container (backend cần đang chạy ở cổng 5000):
```
docker run -d --name frontend-test -p 3000:80 havu2005/frontend
```
Mở: http://localhost:3000

Khi triển khai trên đám mây, build lại với `VITE_API_URL` là địa chỉ backend công khai.