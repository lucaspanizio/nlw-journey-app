export function parseJSON(jsonString: string) {
  try {
    return jsonString ? JSON.parse(jsonString) : {};
  } catch (error) {
    console.error('Invalid JSON string:', jsonString);
    return {};
  }
}
