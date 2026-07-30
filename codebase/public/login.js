import { DEMO_ACCOUNTS, findAccount, getSession, saveSession } from "/auth.js";

const els = {
  form: document.getElementById("loginForm"),
  username: document.getElementById("usernameInput"),
  password: document.getElementById("passwordInput"),
  error: document.getElementById("loginError"),
  demoList: document.getElementById("demoList"),
};

// Đã đăng nhập rồi thì đi thẳng vào màn tương ứng, khỏi bắt gõ lại.
const existing = getSession();
if (existing) {
  location.replace(existing.role === "admin" ? "/admin.html" : "/index.html");
}

renderDemoAccounts();
els.form.addEventListener("submit", onSubmit);

function onSubmit(event) {
  event.preventDefault();
  const account = findAccount(els.username.value, els.password.value);

  if (!account) {
    // Không nói rõ sai tài khoản hay sai mật khẩu — thói quen tốt, giữ luôn cho demo.
    showError("Tài khoản hoặc mật khẩu không đúng. Dùng một trong hai tài khoản demo bên dưới.");
    els.password.value = "";
    els.password.focus();
    return;
  }

  saveSession(account);
  location.href = account.home;
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}

function renderDemoAccounts() {
  els.demoList.innerHTML = "";
  for (const account of DEMO_ACCOUNTS) {
    const item = document.createElement("li");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "login-demo-btn";
    button.addEventListener("click", () => {
      els.username.value = account.username;
      els.password.value = account.password;
      els.error.hidden = true;
      els.form.requestSubmit();
    });

    const role = document.createElement("strong");
    role.textContent = account.name;

    const creds = document.createElement("code");
    creds.textContent = `${account.username} / ${account.password}`;

    const dest = document.createElement("span");
    dest.className = "hint";
    dest.textContent = account.role === "admin" ? "→ Bảng theo dõi lớp" : "→ Màn hình học";

    button.append(role, creds, dest);
    item.append(button);
    els.demoList.append(item);
  }
}
