import axios from "axios";
import { mockShoppingLists } from "./mockData";

const API_BASE_URL = "http://localhost:3000";
const USE_MOCK_DATA = true; 

export const getShoppingLists = async () => {
  if (USE_MOCK_DATA) {
    return mockShoppingLists;
  } else {
    const response = await axios.get(`${API_BASE_URL}/shoppingLists`);
    return response.data;
  }
};

export const addShoppingList = async (newList) => {
  if (USE_MOCK_DATA) {
    newList.id = mockShoppingLists.length + 1;
    mockShoppingLists.push(newList);
    return newList;
  } else {
    const response = await axios.post(`${API_BASE_URL}/shoppingLists`, newList);
    return response.data;
  }
};

export const updateShoppingList = async (updatedList) => {
  if (USE_MOCK_DATA) {
    const index = mockShoppingLists.findIndex((list) => list.id === updatedList.id);
    mockShoppingLists[index] = updatedList;
    return updatedList;
  } else {
    const response = await axios.put(`${API_BASE_URL}/shoppingLists/${updatedList.id}`, updatedList);
    return response.data;
  }
};

export const deleteShoppingList = async (listId) => {
  if (USE_MOCK_DATA) {
    const index = mockShoppingLists.findIndex((list) => list.id === listId);
    mockShoppingLists.splice(index, 1);
  } else {
    await axios.delete(`${API_BASE_URL}/shoppingLists/${listId}`);
  }
};