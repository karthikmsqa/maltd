import React from "react";
import renderer from "react-test-renderer";
import Adapter from "enzyme-adapter-react-16";
import Enzyme, { shallow } from "enzyme";
import MainPage from "./MainPage";

Enzyme.configure({ adapter: new Adapter() });

describe("Main page", () => {
  test("Component renders as expected", () => {
    const component = renderer.create(<MainPage />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  let wrapper;
  let instance;

  beforeEach(() => {
    wrapper = shallow(<MainPage />);
    instance = wrapper.instance();
  });

  describe("onBackClick", () => {
    test("Function modifies local state and takes user to user search screen as expected", () => {
      const clearFormFunc = jest.spyOn(MainPage.prototype, "clearForm");

      wrapper.setState({ isUserSearch: false });
      wrapper.find("BackIcon").simulate("click");

      expect(instance.state.isUserSearch).toBe(true);
      expect(clearFormFunc).toHaveBeenCalled();
      expect(instance.state.userExists).toBe(null);
      expect(instance.state.value).toBe("");
      expect(instance.state.isLoading).toBe(false);
      expect(instance.state.disabledButton).toBe(true);
      expect(instance.state.disabledInput).toBe(false);
      expect(instance.state.invalidInput).toBe(false);
      expect(instance.state.validInput).toBe(false);
    });
  });

  describe("updateSelectedDropdownItem", () => {
    test("Function updates the selected dropdown item", () => {
      const selectedProject = { id: "1", name: "project", type: "type" };

      wrapper.setState({ isUserSearch: false });
      wrapper
        .find("UserAccess")
        .props()
        .onDropdownClick(selectedProject);

      expect(instance.state.selectedDropdownItem).toBe(selectedProject);
    });
  });
});
