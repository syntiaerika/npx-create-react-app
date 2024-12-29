const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let shoppingLists = [
  {
    id: 1,
    name: "Nákupný zoznam 1",
    owner: "user123",
    members: ["user456", "user789"],
    items: [
      { id: 1, name: "Matcha", done: false },
      { id: 2, name: "Mandľové mlieko", done: true },
      { id: 3, name: "Starbucks", done: false },
    ],
  },
  {
    id: 2,
    name: "Nákupný zoznam 2",
    owner: "user456",
    members: ["user123"],
    items: [
      { id: 4, name: "Matcha", done: false },
      { id: 5, name: "Mandľové mlieko", done: true },
      { id: 6, name: "Starbucks", done: false },
    ],
  },
];

app.get("/shoppingLists", (req, res) => {
  res.json(shoppingLists);
});

app.post("/shoppingLists", (req, res) => {
  const newList = req.body;
  newList.id = shoppingLists.length + 1;
  shoppingLists.push(newList);
  res.status(201).json(newList);
});

app.put("/shoppingLists/:id", (req, res) => {
  const listId = parseInt(req.params.id);
  const updatedList = req.body;
  shoppingLists = shoppingLists.map((list) =>
    list.id === listId ? updatedList : list
  );
  res.json(updatedList);
});

app.delete("/shoppingLists/:id", (req, res) => {
  const listId = parseInt(req.params.id);
  shoppingLists = shoppingLists.filter((list) => list.id !== listId);
  res.sendStatus(204);
});


app.listen(port, () => {
  console.log(`Server počúva na porte ${port}`);
});