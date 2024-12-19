export function extractJSON(text) {
  const regex = /```json\s*([\s\S]*?)\s*```/g;
  let match = regex.exec(text);

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    console.error("Invalid JSON found:", error);
  }

  return {}
}