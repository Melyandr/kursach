// contentFactory.js
export const contentFactory = (mode, token) => {
  return async (articleData) => {
    const formData = new FormData();

    Object.keys(articleData).forEach((key) => {
      if (articleData[key] !== undefined && articleData[key] !== null) {
        formData.append(key, articleData[key]);
      }
    });

    const res = await fetch("http://127.0.0.1:8000/api/articles/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Помилка створення: ${text}`);
    }

    return res.json();
  };
};
