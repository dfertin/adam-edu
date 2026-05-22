const PREFIX = "adam_edu_";

export function getStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function removeStorage(key) {
  localStorage.removeItem(PREFIX + key);
}

export function addRecentCourse(course) {
  const list = getStorage("recent_courses", []);
  const next = [
    { slug: course.slug, title: course.title, at: Date.now() },
    ...list.filter((c) => c.slug !== course.slug)
  ].slice(0, 5);
  setStorage("recent_courses", next);
}
