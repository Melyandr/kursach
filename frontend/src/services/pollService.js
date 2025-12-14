
export async function createPoll({ question, channelId, choices }, token) {
  const payload = {
    question,
    channel: channelId || null,
    choices: choices.filter(c => c && c.trim().length > 0)
  };

  const res = await fetch("http://127.0.0.1:8000/api/polls/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}


