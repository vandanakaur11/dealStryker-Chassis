import React from "react";
import PropTypes from "prop-types";
import { Form, Input, Button, Icon, Checkbox, message, Select } from "antd";
import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login";
import { googleClientId, facebookClientId } from "../../socialCredits";
import ResetPasswordForm from "../ResetPasswordForm";
import { sortManufacturersByName } from "./utils";
import "./style.css";

class EditForm extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    const { form, user } = this.props;
    form.setFieldsValue
    ({
       name: user.name,
       type: user.type,
       manufacturers: user.manufacturers,
       zip: user.zip,
    })

    const {
      actions: { getManufacturers },
    } = this.props;
    
    getManufacturers();
  }

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
    const { form, editUser, user} = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, type, manufacturers, zip } = values;
        const { email } = user;
         
        editUser({
          name,
          email,
          type,
          manufacturers,
          zip
        });
      }
    });
  };

 

  render()  {
    const { getFieldDecorator } = this.props.form;
    const { user, manufacturers } = this.props;
    
    return (
      <div className="AddUser-wrapper">
        <Form onSubmit={this.handleSubmit} className="AddUser">
          <h2 className="AddUser-title">Edit Profile</h2>
          
          <Form.Item>
          {getFieldDecorator("name", {
            rules: [{ required: true}],
          })(
            <Input
              prefix={<Icon type="user"  />}
              type="text"
              
              
            />
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator("type", {
            rules: [
              {
                required: true,
                
              },
            ],
          })(
            <Select
              disabled={user.type==="Manager"?true : false}
              placeholder="User Role"
              onChange={this.onChangeSelect}
            >
                    <Select.Option key="Manager" >
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
        {user?.name==user?.dealershipName?
        <div>
        <Form.Item>
          {getFieldDecorator("manufacturers", {
            rules: [
              {
                required: true,
                
              },
            ],
          })(
            <Select

              mode="multiple"
              placeholder="Manufacturers"
              onChange={this.onChangeSelect}
              optionLabelProp="label"

            >
              {manufacturers &&
                manufacturers
                  .sort(sortManufacturersByName)
                  .map((manufacturer) => (
                    <Select.Option 
                    value={manufacturer} 
                    label={manufacturer} 
                    key={manufacturer} 
                    selected={user.manufacturers.includes(manufacturer) ? true : false}>
                      {manufacturer}
                    </Select.Option>
                  ))}
            </Select>)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("zip", {
            
            rules: [
              { required: true,  },
  
            ],
          })(
            <Input
              prefix={<Icon type="compass" />}
              type="text"
              placeholder="Zip code"
            />
          )}
        </Form.Item>
        </div>:null}
          <Button
            type="primary"
            htmlType="submit"
            className="AddUser-btn"
          >
            Save Changes
          </Button>
        
        </Form>

      </div>
    );
  }
}

EditForm.propTypes = {
  className: PropTypes.string,
  intl: PropTypes.object,
  onSend: PropTypes.func,
};

export default Form.create({ name: "EditUser" })(EditForm);
