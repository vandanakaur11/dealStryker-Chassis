import React from "react";
import PropTypes from "prop-types";
import { Button, Table, Empty } from "antd";
import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login";
import { googleClientId, facebookClientId } from "../../socialCredits";
import ResetPasswordForm from "../ResetPasswordForm";
import "./style.css";

class ManagerUsersTable extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  handleDelete = (email) => {
    const { actions } = this.props;

      actions.deleteSubuser({
        email
      });   
};
  
  
getLocale = () => {
  const { isDealer } = this.props;
  return {
    emptyText: (
      <Empty
        description={
          "No Subuser Added"
            }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    ),
  };
};
  render()  {
   
    const {userData, isLoading } = this.props;
    console.log(userData?.user);
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name', 
        width: '20%',

      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '20%',
      },
      {
        title: 'Role',
        dataIndex: 'type',
        key: 'id',
        width: '20%',
      },
      {
        title: 'Edit',
        dataIndex: 'manufacturers',
        key: 'id', 
        width: '20%',
        render: (manufacturers, record) =>  (
          <Button
          type="default"
          onClick={() => this.props.history.push({pathname:"/dash/editUser", state: {
            user: record
          }})}              >
          Edit
        </Button>
         ),
      },
      {
        title: 'Remove',
        dataIndex: 'email',
        key: 'id', 
        width: '20%',
        render: (email, record) => (
          <Button
          type="default"
          onClick={()=>this.handleDelete(email)}

        >
          Remove
        </Button>
         ),
      }
    ];
 
    const datasource =   userData?.user?.Dealership?.subuser?.map((user, i) => {
    console.log(userData)
      return (
        
            {
              key: user._id,
              name: user.name,
              email:user.email,
              type: user.type,
              manufacturers: user.manufacturers,
              dealershipName: user.dealershipName,
              
            }
    )});
    
    return (
      <div style={{width:"80%"}}>
      
              
      <Button 
            type="default"
                    onClick={()=>this.props.history.push({pathname:"/dash/AddUser", state: {
                      id:  userData?.user?.Dealership
                    }})}
                  >
                    Add Team Member
              </Button>
              
                
                
      <br />
      <br />         
      <Table
       style={{width:"100%"}}
       columns={columns} 
       loading={isLoading}
       locale={this.getLocale()}
       dataSource={datasource} />
       
       
       
  </div>);
  }
}

ManagerUsersTable.propTypes = {
  className: PropTypes.string,
  intl: PropTypes.object,
  onSend: PropTypes.func,
};

export default (ManagerUsersTable);
