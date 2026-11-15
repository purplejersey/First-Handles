// Short message that fades away on its own.

export function showToast(message) {
  const root = document.getElementById("overlay-root");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}
