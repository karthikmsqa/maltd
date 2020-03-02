import React, { useState } from "react";
import axios from "axios";
import "./MainPage.css";
import UserSearch from "../../composite/UserSearch/UserSearch";
import NavBar from "../../base/NavBar/NavBar";
import BackIcon from "../../base/BackIcon/BackIcon";
import UserAccess from "../../composite/UserAccess/UserAccess";

const baseUrl = process.env.REACT_APP_MALTD_API
  ? process.env.REACT_APP_MALTD_API
  : "http://localhost:80";

export default function MainPage() {
  // declare state variables, using hooks
  const [validInput, setValidInput] = useState(false);
  const [invalidInput, setInvalidInput] = useState(false);
  const [value, setValue] = useState("");
  const [disabledInput, setDisabledInput] = useState(false);
  const [disabledButton, setDisabledButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserSearch, setIsUserSearch] = useState(true);
  const [projects, setProjects] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [color, setColor] = useState("primary");
  const [userExists, setUserExists] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedDropdownItem, setSelectedDropdownItem] = useState(null);

  const inputField = {
    type: "text",
    name: "idir",
    placeholder: "Enter IDIR username to find",
    valid: validInput,
    invalid: invalidInput,
    value,
    disabled: disabledInput
  };

  const generalButton = {
    type: "submit",
    color,
    disabled: disabledButton,
    label: "Find"
  };

  const userSearch = {
    state: {
      isLoading,
      userExists
    }
  };

  const userAccess = {
    projects,
    userName,
    userEmail
  };

  const backIcon = {
    message: "Find another user"
  };

  const dropdown = {
    items
  };

  function clearForm() {
    setUserExists(false);
    setIsLoading(false);
    setDisabledButton(true);
    setDisabledInput(false);
    setInvalidInput(false);
    setValidInput(false);
  }

  function updateSelectedDropdownItem(selectedProject) {
    setSelectedDropdownItem(selectedProject);
  }

  function onLogoutClick() {}

  function addUserToProject() {
    axios
      .put(`${baseUrl}/api/projects/${selectedDropdownItem.id}/users/${value}`)
      .then(() => {
        const updatedProjects = projects.slice(0);
        updatedProjects.push(selectedDropdownItem);
        setProjects(updatedProjects);
      })
      .catch(() => {});
  }

  function removeUserFromProject(projectId) {
    axios
      .delete(`${baseUrl}/api/projects/${projectId}/users/${value}`)
      .then(() => {
        const updatedProjects = [];
        projects.forEach(proj => {
          if (proj.id !== projectId) {
            updatedProjects.push(proj);
          }
        });
        setProjects(updatedProjects);
      })
      .catch(() => {});
  }
  
  function onButtonClick() {
    fetch(`${baseUrl}/api/projects`)
      .then(res => res.json())
      .then(resul => {
        if (resul.status !== 401) {
          setItems(resul);

          setIsLoading(true);
          setDisabledButton(true);
          setDisabledInput(true);

          fetch(`${baseUrl}/api/users/${value}`)
            .then(res2 => res2.json())
            .then(result => {
              if (result.status !== 404) {
                setProjects(result.projects);

                if (result.email) {
                  setUserEmail(result.email);
                }
                if (result.firstName && result.lastName) {
                  setUserName(`${result.firstName} ${result.lastName}`);
                }

                setIsUserSearch(false);
              } else {
                clearForm();
              }
            })
            .catch(() => {
              clearForm();
            });
        }
      })
      .catch(() => {});
  }

  function onKeyEnter(event) {
    if (event.key === "Enter" && !disabledButton) {
      onButtonClick();
    }
  }

  function onInputChange(event) {
    setUserExists(null);
    const val = event.target.value;

    if (val.length === 0) {
      setInvalidInput(false);
      setValidInput(false);
      setDisabledButton(true);
      setColor("primary");
    } else if (val.length < 5) {
      setInvalidInput(true);
      setColor("danger");
    } else {
      setInvalidInput(false);
      setValidInput(true);
      setDisabledButton(false);
      setColor("primary");
    }

    setValue(event.target.value);
  }

  function onBackClick() {
    setIsUserSearch(true);
    clearForm();
    setUserExists(null);
    setValue("");
  }

  return (
    <React.Fragment>
      <NavBar onClick={onLogoutClick} />
      <div className="top-spacing" id="wrapper">
        {!isUserSearch && (
          <div className="backicon-spacing">
            <BackIcon backIcon={backIcon} onClick={onBackClick} />
          </div>
        )}
        <div className="my-3 p-3 rounded shadow less-spacing-top">
          <h4 className="add-remove-text">Add or Remove User</h4>
          {isUserSearch && (
            <UserSearch
              userSearch={userSearch}
              inputField={inputField}
              onChange={onInputChange}
              generalButton={generalButton}
              onClick={onButtonClick}
              onKeyEnter={onKeyEnter}
            />
          )}

          {!isUserSearch && (
            <UserAccess
              userAccess={userAccess}
              onXClick={removeUserFromProject}
              onPlusClick={addUserToProject}
              onDropdownClick={updateSelectedDropdownItem}
              dropdown={dropdown}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
