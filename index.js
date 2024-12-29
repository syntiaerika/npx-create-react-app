const express = require("express");
const bodyParser = require("body-parser");
const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/shoppingListApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const ShoppingList = mongoose.model("ShoppingList", {
  name: { type: String, required: true },
  owner: { type: String, required: true },
  members: [String],
});

const Item = mongoose.model("Item", {
  name: { type: String, required: true },
  checked: { type: Boolean, default: false },
  shoppingList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShoppingList",
    required: true,
  },
});

const app = express();
app.use(bodyParser.json());

const users = {
  user1: "Owner",
  user2: "Member",
};

function authorize(role) {
  return (req, res, next) => {
    const userId = req.headers["user-id"];
    if (!userId || users[userId] !== role) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
}


app.post(
  "/shopping-list/create",
  [
    body("name")
      .isString()
      .withMessage("Názov zoznamu musí byť string."),
    body("members")
      .isArray()
      .optional()
      .withMessage("Členovia musia byť vyplnený."),
  ],
  authorize("Owner"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, members = [] } = req.body;

    try {
      const newList = new ShoppingList({
        name,
        owner: req.headers["user-id"],
        members,
      });
      await newList.save();
      return res.status(201).json(newList);
    } catch (err) {
      console.error(err); 
      return res.status(500).json({
        error: "shoppingListDao.create",
        message: "Chyba pri ukladaní do databázy",
        parameters: {
          databaseError: {
            code: err.code,
            message: err.message,
          },
        },
      });
    }
  }
);


app.post(
  "/shopping-list/:id/item/add",
  [
    param("id").isMongoId().withMessage("Neplatné ID zoznamu."),
    body("name").isString().withMessage("Názov položky musí byť string."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name } = req.body;

    try {
      const shoppingList = await ShoppingList.findById(id);
      if (!shoppingList) {
        return res
          .status(404)
          .json({ message: "Nákupný zoznam sa neexistuje" });
      }

      const userId = req.headers["user-id"];
      if (
        shoppingList.owner !== userId &&
        !shoppingList.members.includes(userId)
      ) {
        return res
          .status(403)
          .json({ message: "Forbidden: Access denied" });
      }

      const newItem = new Item({ name, shoppingList: id });
      await newItem.save();
      return res.status(201).json(newItem);
    } catch (err) {
      console.error(err); 
      return res.status(500).json({
        error: "itemDao.create",
        message: "Chyba pri ukladaní do databázy",
        parameters: {
          databaseError: {
            code: err.code,
            message: err.message,
          },
        },
      });
    }
  }
);


app.patch(
  "/shopping-list/:id/item/:itemId/complete",
  [
    param("id").isMongoId().withMessage("Neplatné ID zoznamu."),
    param("itemId").isMongoId().withMessage("Neplatné ID položky."),
    body("checked")
      .isBoolean()
      .withMessage("Hodnota 'checked' musí byť boolean."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, itemId } = req.params;
    const { checked } = req.body;

    try {
      const shoppingList = await ShoppingList.findById(id);
      if (!shoppingList) {
        return res.status(404).json({ message: "Nákupný zoznam sa nenašiel" });
      }

      const userId = req.headers["user-id"];
      if (
        shoppingList.owner !== userId &&
        !shoppingList.members.includes(userId)
      ) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      const item = await Item.findOne({ _id: itemId, shoppingList: id });
      if (!item) {
        return res.status(404).json({ message: "Položka sa nenašla" });
      }

      item.checked = checked;
      await item.save();
      return res.status(200).json(item);
    } catch (err) {
      console.error(err); 
      return res.status(500).json({
        error: "itemDao.update",
        message: "Chyba pri ukladaní do databázy",
        parameters: {
          databaseError: {
            code: err.code,
            message: err.message,
          },
        },
      });
    }
  }
);

app.delete(
  "/shopping-list/:id/delete",
  [param("id").isMongoId().withMessage("Neplatné ID zoznamu.")],
  authorize("Owner"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      await ShoppingList.findByIdAndDelete(id);
      await Item.deleteMany({ shoppingList: id });
      return res
        .status(200)
        .json({ message: "Nákupný zoznam bol zmazaný." });
    } catch (err) {
      console.error(err); 
      return res.status(500).json({
        error: "shoppingListDao.delete",
        message: "Chyba pri mazaní zoznamu",
        parameters: {
          databaseError: {
            code: err.code,
            message: err.message,
          },
        },
      });
    }
  }
);


app.get("/shopping-list/list", async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find();
    return res.status(200).json(shoppingLists);
  } catch (err) {
    console.error(err); 
    return res.status(500).json({
      error: "shoppingListDao.find",
      message: "Chyba pri načítaní zoznamov",
      parameters: {
        databaseError: {
          code: err.code,
          message: err.message,
        },
      },
    });
  }
});

app.get(
  "/shopping-list/get/:id",
  [param("id").isMongoId().withMessage("Neplatné ID zoznamu.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
      const shoppingList = await ShoppingList.findById(id);
      if (!shoppingList) {
        return res.status(404).json({ message: "Nákupný zoznam sa nenašiel" });
      }
      return res.status(200).json(shoppingList);
    } catch (err) {
      console.error(err); 
      return res.status(500).json({
        error: "shoppingListDao.get",
        message: "Chyba pri načítaní zoznamov",
        parameters: {
          databaseError: {
            code: err.code,
            message: err.message,
          },
        },
      });
    }
  }
);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));