
export const runModerationScript = async (): Promise<{ output: string; success: boolean }> => {
  const resp = await fetch("http://localhost:5000/run-moderation", {
    method: "POST",
  });
  return await resp.json();
};

export const runOllamaResponseScript = async (): Promise<{ output: string; success: boolean }> => {
  const resp = await fetch("http://localhost:5000/run-ollama-response", {
    method: "POST",
  });
  return await resp.json();
};
