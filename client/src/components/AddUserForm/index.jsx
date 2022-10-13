import React from "react";
import PropTypes from "prop-types";
import { Form, Input, Button, Icon, Checkbox, message, Select } from "antd";
import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login";
import { googleClientId, facebookClientId } from "../../socialCredits";
import ResetPasswordForm from "../ResetPasswordForm";
import "./style.css";

class AddUserForm extends React.Component {
  // constructor(props) {
  //   super(props);
  // }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const { form } = this.props;

    if (this.props.error && this.props.error !== prevProps.error)
      form.setFields({
        password: {
          errors: [new Error("User is not exists or wrong password")],
        },
      });
  }

  handleSubmit = (e) => {
    const { form, onSignUp } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const role="subuser";
        const { email, name, type } = values;
        const { id } = this.props;

        onSignUp({
          email,
          role,
          name,
          type,
          id
        })
      }
    });
  };

 

  render()  {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="AddUser-wrapper">
        <Form onSubmit={this.handleSubmit} className="AddUser">
          <h2 className="centre AddUser-title">Add Team Member</h2>
          <Form.Item>
            {getFieldDecorator("email", {
              rules: [{ required: true, message: "Please input User's E-mail!" }],
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="email"
                placeholder="E-mail"
              />
            )}
          </Form.Item>
          <Form.Item>
          {getFieldDecorator("name", {
            rules: [{ required: true, message: "Please input User's name!" }],
          })(
            <Input
              prefix={<Icon type="user"  />}
              type="text"
              placeholder="User's Name"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("type", {
            rules: [
              {
                required: true,
                message: "Please select a User Role",
              },
            ],
          })(
            <Select
              placeholder="User Role"
              onChange={this.onChangeSelect}
            >
                    <Select.Option key="Manager">
                      Manager
                    </Select.Option>
                    <Select.Option key="Finance">
                      Finance
                    </Select.Option>
                    <Select.Option key="Sales">
                      Sales
                    </Select.Option>
            </Select>
          )}
        </Form.Item>
         
          <Button
            type="primary"
            htmlType="submit"
            className="AddUser-btn"
          >
            Add Team Member
          </Button>
        
        </Form>

      </div>
    );
  }
}

AddUserForm.propTypes = {
  className: PropTypes.string,
  intl: PropTypes.object,
  onSend: PropTypes.func,
};

export default Form.create({ name: "AddUser" })(AddUserForm);
