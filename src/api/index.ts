const API_URL = 'http://localhost:3000/api';

export async function fetchItems(entityType: string) {
  try {
    const response = await fetch(`${API_URL}/${entityType}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${entityType}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw error;
  }
}

export async function createItem(entityType: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/${entityType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create ${entityType}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error creating ${entityType}:`, error);
    throw error;
  }
}

export async function updateItem(entityType: string, id: number, data: any) {
  try {
    const response = await fetch(`${API_URL}/${entityType}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ${entityType}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error updating ${entityType}:`, error);
    throw error;
  }
}

export async function deleteItem(entityType: string, id: number) {
  try {
    const response = await fetch(`${API_URL}/${entityType}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${entityType}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error deleting ${entityType}:`, error);
    throw error;
  }
}

export async function fetchRelatedItems(entityType: string, params: Record<string, string>) {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/${entityType}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch related ${entityType}: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching related ${entityType}:`, error);
    throw error;
  }
}