const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// API service to create user
export const createUser = async (userData: { name: string; phone: string }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const uploadFiles = async (files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await fetch(`${BASE_URL}/api/tokens/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload files");
    }

    return await response.json(); // Return the token data
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error; // Re-throw error to be handled in the component
  }
};

export const createBubble = async (
  content: string,
  tokenIds: string[],
  phone: string
): Promise<any> => {
  const bubbleData = {
    content,
    tokens: tokenIds,
    createdByPhone: phone,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/bubbles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bubbleData),
    });

    if (!response.ok) {
      throw new Error("Failed to create bubble");
    }

    return await response.json(); // Return the created bubble data
  } catch (error) {
    console.error("Error creating bubble:", error);
    throw error; // Re-throw error to be handled in the component
  }
};
