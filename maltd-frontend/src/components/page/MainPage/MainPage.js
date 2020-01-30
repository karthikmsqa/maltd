/* eslint-disable react/jsx-filename-extension */
import React from "react";
import PropTypes from "prop-types";
import InputField from "../../base/InputField/InputField";
import GeneralButton from "../../base/GeneralButton/GeneralButton";
import "./MainPage.css";

export default function MainPage({
  userSearch: { state },
  inputField,
  generalButton
}) {
  return (
    <div className="container my-3 p-3 rounded shadow">
      <h4>Add or Remove User</h4>
      <p />
      {!state.isLoading && (
        <div>
          <InputField inputField={inputField} />
          <p />
          <GeneralButton generalButton={generalButton} />
        </div>
      )}
      {state.isLoading && (
        <div>
          <div>
            <InputField inputField={inputField} />
            <p />
            <div>
              <div className="float-left">
                <p className="float-left">
                  <small id="loading">Loading...</small>
                </p>
              </div>
              <GeneralButton generalButton={generalButton} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

MainPage.propTypes = {
  userSearch: PropTypes.shape({
    state: PropTypes.any.isRequired
  }).isRequired,
  inputField: PropTypes.shape({
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    valid: PropTypes.bool.isRequired,
    invalid: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired
  }).isRequired,
  generalButton: PropTypes.shape({
    type: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    label: PropTypes.any.isRequired
  }).isRequired
};
