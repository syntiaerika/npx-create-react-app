import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ShoppingListsOverview.css";
import {
  getShoppingLists,
  addShoppingList,
  deleteShoppingList,
} from "./api";
import { FormattedMessage, IntlProvider, useIntl } from "react-intl";

const translations = {
  sk: {
    title: "Nákupné zoznamy",
    addList: "Pridať nákupný zoznam",
    newListName: "Názov zoznamu",
    add: "Pridať",
    cancel: "Zrušiť",
    delete: "Zmazať",
    deleteConfirmation: 'Naozaj chcete zmazať zoznam "{listName}"?',
  },
  en: {
    title: "Shopping Lists",
    addList: "Add Shopping List",
    newListName: "List Name",
    add: "Add",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirmation: 'Are you sure you want to delete the list "{listName}"?',
  },
};

function ShoppingListsOverview() {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shoppingListToDelete, setShoppingListToDelete] = useState(null);
  const [newListName, setNewListName] = useState("");
  const currentUser = "user123";
  const [language, setLanguage] = useState("sk");
  const intl = useIntl();

  useEffect(() => {
    const fetchShoppingLists = async () => {
      const lists = await getShoppingLists();
      setShoppingLists(lists);
    };
    fetchShoppingLists();
  }, []);

  const handleAddShoppingList = async () => {
    const newList = {
      name: newListName,
      owner: currentUser,
      members: [],
      items: [],
    };
    const addedList = await addShoppingList(newList);
    setShoppingLists([...shoppingLists, addedList]);
    setNewListName("");
    setIsAddModalOpen(false);
  };

  const handleDeleteShoppingList = async () => {
    await deleteShoppingList(shoppingListToDelete.id);
    setShoppingLists(
      shoppingLists.filter((list) => list.id !== shoppingListToDelete.id),
    );
    setIsDeleteModalOpen(false);
    setShoppingListToDelete(null);
  };

  return (
    <div className="shopping-lists-overview">
      <h1>
        <FormattedMessage id="title" />
      </h1>
      <button onClick={() => setIsAddModalOpen(true)}>
        <FormattedMessage id="addList" />
      </button>

      <div className="shopping-lists-grid">
        {shoppingLists.map((list) => (
          <div key={list.id} className="shopping-list-tile">
            <Link to={`/shopping-list/${list.id}`}>{list.name}</Link>
            {list.owner === currentUser && (
              <button
                onClick={() => {
                  setShoppingListToDelete(list);
                  setIsDeleteModalOpen(true);
                }}
              >
                <FormattedMessage id="delete" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              <FormattedMessage id="addList" />
            </h2>
            <input
              type="text"
              placeholder={intl.formatMessage({ id: "newListName" })}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <button onClick={handleAddShoppingList}>
              <FormattedMessage id="add" />
            </button>
            <button onClick={() => setIsAddModalOpen(false)}>
              <FormattedMessage id="cancel" />
            </button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              <FormattedMessage
                id="deleteConfirmation"
                values={{ listName: shoppingListToDelete.name }}
              />
            </h2>
            <button onClick={handleDeleteShoppingList}>
              <FormattedMessage id="delete" />
            </button>
            <button onClick={() => setIsDeleteModalOpen(false)}>
              <FormattedMessage id="cancel" />
            </button>
          </div>
        </div>
      )}

      <div>
        <button onClick={() => setLanguage("sk")}>SK</button>
        <button onClick={() => setLanguage("en")}>EN</button>
      </div>
    </div>
  );
}

function AppWithIntl() {
  const [language, setLanguage] = useState("sk");

  return (
    <IntlProvider locale={language} messages={translations[language]}>
      <ShoppingListsOverview />
    </IntlProvider>
  );
}

export default AppWithIntl;