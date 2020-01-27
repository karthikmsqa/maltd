/* eslint-disable react/jsx-filename-extension */
import React from "react";
import { storiesOf } from "@storybook/react";
import "bootstrap/dist/css/bootstrap.css";
import GeneralButton from "./GeneralButton";

const generalButton = {
  type: "submit",
  color: "primary",
  disabled: true,
  block: false,
  active: false,
  outline: false,
  label: "Find",
  styling: "general-button"
};

storiesOf("GeneralButton", module)
  .add("default", () => <GeneralButton generalButton={generalButton} />)
  .add("valid", () => (
    <GeneralButton generalButton={{ ...generalButton, disabled: false }} />
  ))
  .add("invalid", () => (
    <GeneralButton generalButton={{ ...generalButton, color: "danger" }} />
  ));