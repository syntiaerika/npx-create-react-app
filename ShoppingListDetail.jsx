import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./ShoppingListDetail.css";
import { getShoppingLists, updateShoppingList } from "./api";
import { FormattedMessage, useIntl } from "react-intl";

const translations = {
  sk: {
    save: "Uložiť",
    cancel: "Zrušiť",
    editName: "Upraviť názov",
    members: "Členovia",
    remove: "Odstrániť",
    addMember: "Pridať člena",
    addMemberButton: "Pridať",
    leaveList: "Opustiť zoznam",
    items: "Položky",
    all: "Všetky",
    done: "Hotové",
    undone: "Nehotové",
    edit: "Upraviť",
    delete: "Zmazať",
    addItem: "Pridať položku",
  },
  en: {
    save: "Save",
    cancel: "Cancel",
    editName: "Edit Name",
    members: "Members",
    remove: "Remove",
    addMember: "Add Member",
    addMemberButton: "Add",
    leaveList: "Leave List",
    items: "Items",
    all: "All",
    done: "Done",
    undone: "Undone",
    edit: "Edit",
    delete: "Delete",
    addItem: "Add Item",
  },
};

function ShoppingListDetail() {
  const { id } = useParams();
  const [shoppingList, setShoppingList] = useState(null);
  const [currentUser, setCurrentUser] = useState("user123");

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingItemName, setEditingItemName] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newMember, setNewMember] = useState("");
  const [newItem, setNewItem] = useState("");
  const [filter, setFilter] = useState("all");
  const intl = useIntl();

  useEffect(() => {
    const fetchShoppingList = async () => {
      const lists = await getShoppingLists();
      const list = lists.find((list) => list.id === parseInt(id));
      setShoppingList(list);
      setNewName(list?.name || "");
    };
    fetchShoppingList();
  }, [id]);

  if (!shoppingList) {
    return <div>Načítavam...</div>;
  }

  const handleCheckItem = async (itemId) => {
    const updatedList = {
      ...shoppingList,
      items: shoppingList.items.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
    };
    const savedList = await updateShoppingList(updatedList);
    setShoppingList(savedList);
  };

  const handleEditName = () => {
    setEditingName(true);
  };

  const handleSaveName = async () => {
    const updatedList = { ...shoppingList, name: newName };
    const savedList = await updateShoppingList(updatedList);
    setShoppingList(savedList);
    setEditingName(false);
  };

  const handleCancelName = () => {
    setEditingName(false);
    setNewName(shoppingList.name);
  };

  const handleAddMember = () => {
    if (newMember) {
      setShoppingList({
        ...shoppingList,
        members: [...shoppingList.members, newMember],
      });
      setNewMember("");
    }
  };

  const handleRemoveMember = (index) => {
    setShoppingList({
      ...shoppingList,
      members: shoppingList.members.filter((_, i) => i !== index),
    });
  };

  const handleLeaveShoppingList = () => {
    
  };

  const handleAddItem = () => {
    if (newItem) {
      setShoppingList({
        ...shoppingList,
        items: [
          ...shoppingList.items,
          { id: Date.now(), name: newItem, done: false },
        ],
      });
      setNewItem("");
    }
  };

  const handleDeleteItem = async (itemId) => {
    const updatedList = {
      ...shoppingList,
      items: shoppingList.items.filter((item) => item.id !== itemId),
    };
    const savedList = await updateShoppingList(updatedList);
    setShoppingList(savedList);
  };

  const filteredItems = shoppingList.items.filter((item) => {
    if (filter === "all") {
      return true;
    } else if (filter === "done") {
      return item.done;
    } else {
      return !item.done;
    }
  });

  return (
    <div className="shopping-list-detail">
      <div className="shopping-list-header">
        {editingName ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        ) : (
          <h2>{shoppingList.name}</h2>
        )}
        {shoppingList.owner === currentUser && (
          <div>
            {editingName ? (
              <>
                <button onClick={handleSaveName}>
                  <FormattedMessage id="save" />
                </button>
                <button onClick={handleCancelName}>
                  <FormattedMessage id="cancel" />
                </button>
              </>
            ) : (
              <button onClick={handleEditName}>
                <FormattedMessage id="editName" />
              </button>
            )}
          </div>
        )}
      </div>

      <h3>
        <FormattedMessage id="members" />
      </h3>
      <ul>
        {shoppingList.members.map((member, index) => (
          <li key={index}>
            {member}
            {shoppingList.owner === currentUser &&
              member !== currentUser && (
                <button onClick={() => handleRemoveMember(index)}>
                  <FormattedMessage id="remove" />
                </button>
              )}
          </li>
        ))}
      </ul>
      {shoppingList.owner === currentUser && (
        <div>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: "addMember" })}
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
          />
          <button onClick={handleAddMember}>
            <FormattedMessage id="addMemberButton" />
          </button>
        </div>
      )}
      {shoppingList.members.includes(currentUser) &&
        shoppingList.owner !== currentUser && (
          <button onClick={handleLeaveShoppingList}>
            <FormattedMessage id="leaveList" />
          </button>
        )}

      <h3>
        <FormattedMessage id="items" />
      </h3>
      <div className="filter">
        <button onClick={() => setFilter("all")}>
          <FormattedMessage id="all" />
        </button>
        <button onClick={() => setFilter("done")}>
          <FormattedMessage id="done" />
        </button>
        <button onClick={() => setFilter("undone")}>
          <FormattedMessage id="undone" />
        </button>
      </div>
      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => handleCheckItem(item.id)}
            />
            {editingItemName === item.id ? (
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            ) : (
              <span className={item.done ? "done" : ""}>{item.name}</span>
            )}
            <div>
              {editingItemName === item.id ? (
                <>
                  <button
                    onClick={async () => {
                      const updatedList = {
                        ...shoppingList,
                        items: shoppingList.items.map((i) =>
                          i.id === item.id ? { ...i, name: newItemName } : i,
                        ),
                      };
                      const savedList = await updateShoppingList(updatedList);
                      setShoppingList(savedList);
                      setEditingItemName(null);
                    }}
                  >
                    <FormattedMessage id="save" />
                  </button>
                  <button onClick={() => setEditingItemName(null)}>
                    <FormattedMessage id="cancel" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingItemName(item.id);
                      setNewItemName(item.name);
                    }}
                  >
                    <FormattedMessage id="edit" />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)}>
                    <FormattedMessage id="delete" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          placeholder={intl.formatMessage({ id: "addItem" })}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button onClick={handleAddItem}>
          <FormattedMessage id="addItem" />
        </button>
      </div>

      <Link to="/">Späť na prehľad</Link>
    </div>
  );
}

function ShoppingListDetailWithIntl() {
  const [language, setLanguage] = useState("sk");

  return (
    <IntlProvider locale={language} messages={translations[language]}>
      <ShoppingListDetail />
      <div>
        <button onClick={() => setLanguage("sk")}>SK</button>
        <button onClick={() => setLanguage("en")}>EN</button>
      </div>
    </IntlProvider>
  );
}

export default ShoppingListDetailWithIntl;