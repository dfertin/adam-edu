export function formatPrice(price) {
  if (!price || price === 0) return "Бесплатно";
  return `${Number(price).toLocaleString("ru-KZ")} тг`;
}

export function formatDate(date) {
  return new Date(date).toLocaleString("ru-KZ", { timeZone: "Asia/Almaty" });
}

export function validateEmail(email) {
  const value = email.trim().toLowerCase();
  if (!value) return "Введите email";
  if ((value.match(/@/g) || []).length !== 1) return "Введите email в формате name@domain.com";
  const parts = value.split("@");
  const local = parts[0];
  const domain = parts[1];
  if (!local) return "Укажите имя перед @";
  if (!domain || !domain.includes(".")) return "Укажите домен после @";
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) {
    return "Неверный формат email";
  }
  return "";
}

export function getErrorMessage(err, fallback = "Ошибка") {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((d) => {
      if (typeof d === "string") return d;
      const msg = d.msg || "";
      return msg.startsWith("Value error, ") ? msg.slice(13) : msg;
    });
    return parts.filter(Boolean).join(". ") || fallback;
  }
  return fallback;
}
