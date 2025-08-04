
export const runModerationScript = async (backendUrl: string = 'http://localhost:5000'): Promise<{ output: string; success: boolean }> => {
  try {
    const resp = await fetch(`${backendUrl}/run-moderation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    
    return await resp.json();
  } catch (error) {
    console.error("Error calling moderation endpoint:", error);
    return {
      output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      success: false
    };
  }
};

export const runOllamaResponseScript = async (backendUrl: string = 'http://localhost:5000'): Promise<{ output: string; success: boolean }> => {
  try {
    const resp = await fetch(`${backendUrl}/run-ollama-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    
    return await resp.json();
  } catch (error) {
    console.error("Error calling ollama response endpoint:", error);
    return {
      output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      success: false
    };
  }
};
