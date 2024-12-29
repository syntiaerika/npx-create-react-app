import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShoppingListDetail from "./ShoppingListDetail";
import ShoppingListsOverview from "./ShoppingListsOverview";
import "./App.css";
import { lightTheme, darkTheme } from "./theme";

function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      style={{
        backgroundColor: theme === "light" ? lightTheme.body : darkTheme.body,
        color: theme === "light" ? lightTheme.text : darkTheme.text,
      }}
    >
      <BrowserRouter>
        <button onClick={toggleTheme}>
          {theme === "light" ? "Tmavý režim" : "Svetlý režim"}
        </button>
        <Routes>
          <Route path="/" element={<ShoppingListsOverview />} />
          <Route path="/shopping-list/:id" element={<ShoppingListDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;