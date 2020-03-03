import React, { Component } from "react";
import axios from "axios";
import "./MainPage.css";
import UserSearch from "../../composite/UserSearch/UserSearch";
import NavBar from "../../base/NavBar/NavBar";
import BackIcon from "../../base/BackIcon/BackIcon";
import UserAccess from "../../composite/UserAccess/UserAccess";

const baseUrl = process.env.REACT_APP_MALTD_API
  ? process.env.REACT_APP_MALTD_API
  : "https://localhost:5001";

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validInput: false,
      invalidInput: false,
      value: "",
      disabledInput: false,
      disabledButton: true,
      isLoading: false,
      isUserSearch: true,
      projects: [],
      userEmail: null,
      userName: "",
      color: "primary",
      userExists: null,
      items: [],
      selectedDropdownItem: null
    };
  }

  onButtonClick() {
    const { value } = this.state;

    return axios
      .get(`${baseUrl}/api/projects`)
      .then(res => {
        if (res.status !== 200) {
          return;
        }

        this.setState({
          items: res.data,
          isLoading: true,
          disabledButton: true,
          disabledInput: true
        });

        return axios.get(`${baseUrl}/api/users?q=${value}`).then(res2 => {
          if (res2.status !== 200) {
            return;
          }

          return axios
            .get(`${baseUrl}/api/users/${value}`)
            .then(result => {
              if (result.status === 200) {
                this.setState({
                  projects: result.projects,
                  isUserSearch: false
                });

                if (result.email) {
                  this.setState({ userEmail: result.email });
                }

                if (result.firstName && result.lastName) {
                  this.setState({
                    userName: `${result.firstName} ${result.lastName}`
                  });
                }
              } else {
                this.clearForm();
              }
            })
            .catch(() => {
              this.clearForm();
            });
        });
      })
      .catch(() => {});
  }

  onInputChange(event) {
    this.setState({ userExists: null });
    const val = event.target.value;

    if (val.length === 0) {
      this.setState({
        invalidInput: false,
        validInput: false,
        disabledButton: true,
        color: "primary"
      });
    } else if (val.length < 3) {
      this.setState({
        invalidInput: true,
        color: "danger"
      });
    } else {
      this.setState({
        invalidInput: false,
        validInput: true,
        disabledButton: false,
        color: "primary"
      });
    }

    this.setState({ value: event.target.value });
  }

  onBackClick() {
    this.setState({ isUserSearch: true });

    this.clearForm();

    this.setState({
      userExists: null,
      value: ""
    });
  }

  removeUserFromProject(projectId) {
    const { value, projects } = this.state;

    axios
      .delete(`${baseUrl}/api/projects/${projectId}/users/${value}`)
      .then(() => {
        const updatedProjects = [];
        projects.forEach(proj => {
          if (proj.id !== projectId) {
            updatedProjects.push(proj);
          }
        });
        this.setState({ projects: updatedProjects });
      })
      .catch(() => {});
  }

  addUserToProject() {
    const { selectedDropdownItem, value, projects } = this.state;

    axios
      .put(`${baseUrl}/api/projects/${selectedDropdownItem.id}/users/${value}`)
      .then(() => {
        const updatedProjects = projects.slice(0);
        updatedProjects.push(selectedDropdownItem);
        this.setState({ projects: updatedProjects });
      })
      .catch(() => {});
  }

  updateSelectedDropdownItem(selectedProject) {
    this.setState({ selectedDropdownItem: selectedProject });
  }

  clearForm() {
    this.setState({
      userExists: false,
      isLoading: false,
      disabledButton: true,
      disabledInput: false,
      invalidInput: false,
      validInput: false
    });
  }

  render() {
    const {
      validInput,
      invalidInput,
      value,
      disabledInput,
      disabledButton,
      isLoading,
      isUserSearch,
      projects,
      userEmail,
      userName,
      color,
      userExists,
      items
    } = this.state;

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
      message: "Find a user"
    };

    const dropdown = {
      items
    };

    return (
      <React.Fragment>
        <NavBar onClick={() => {}} />
        <div className="top-spacing" id="wrapper">
          {!isUserSearch && (
            <div className="backicon-spacing">
              <BackIcon
                backIcon={backIcon}
                onClick={() => this.onBackClick()}
              />
            </div>
          )}
          <div className="my-3 p-3 rounded shadow less-spacing-top">
            <h4 className="add-remove-text">Add or Remove User</h4>
            {isUserSearch && (
              <UserSearch
                userSearch={userSearch}
                inputField={inputField}
                onChange={e => this.onInputChange(e)}
                generalButton={generalButton}
                onClick={() => this.onButtonClick()}
              />
            )}

            {!isUserSearch && (
              <UserAccess
                userAccess={userAccess}
                onXClick={id => this.removeUserFromProject(id)}
                onPlusClick={() => this.addUserToProject()}
                onDropdownClick={item => this.updateSelectedDropdownItem(item)}
                dropdown={dropdown}
              />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
