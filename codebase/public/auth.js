// Đăng nhập GIẢ LẬP cho demo — KHÔNG phải xác thực thật.
//
// Hai tài khoản dưới đây là hằng số nằm trong mã nguồn client, mật khẩu để nguyên
// văn và còn được in ra ngay trên màn hình đăng nhập. Vai trò lưu ở localStorage
// nên người dùng tự sửa được, và mọi API vẫn phục vụ công khai không cần token.
// Đây là cổng ĐIỀU HƯỚNG cho demo (vào màn học viên hay màn giảng viên), tuyệt
// đối không phải lớp bảo mật. Xem codebase/MOCKS.md.

const STORAGE_KEY = "vlearn-session-v1";

export const DEMO_ACCOUNTS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "Giảng viên",
    home: "/admin.html",
  },
  {
    username: "hocvien",
    password: "hocvien123",
    role: "learner",
    name: "Học viên",
    home: "/index.html",
  },
];

export function findAccount(username, password) {
  const user = String(username || "").trim().toLowerCase();
  const pass = String(password || "");
  return DEMO_ACCOUNTS.find((acc) => acc.username === user && acc.password === pass) || null;
}

export function saveSession(account) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      username: account.username,
      role: account.role,
      name: account.name,
      at: new Date().toISOString(),
    })
  );
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  location.href = "/login.html";
}

// Cổng điều hướng, không phải kiểm soát truy cập: gõ thẳng /admin.html rồi tự đặt
// localStorage là vào được. Chấp nhận với prototype, không chấp nhận với bản thật.
export function requireRole(role) {
  const session = getSession();
  if (!session) {
    location.replace("/login.html");
    return null;
  }
  if (role && session.role !== role) {
    location.replace(session.role === "admin" ? "/admin.html" : "/index.html");
    return null;
  }
  return session;
}

// Chip hiện vai trò đang đăng nhập + nút đăng xuất. Trả về element để mỗi trang tự
// đặt vào đúng chỗ trong layout của mình.
export function createSessionChip(session) {
  const wrap = document.createElement("div");
  wrap.className = "session-chip";

  const who = document.createElement("span");
  who.className = "session-chip-who";
  who.textContent = `${session.name} · ${session.username}`;

  const out = document.createElement("button");
  out.type = "button";
  out.className = "session-chip-out";
  out.textContent = "Đăng xuất";
  out.addEventListener("click", logout);

  wrap.append(who, out);
  return wrap;
}
