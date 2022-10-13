import ChatPage from "../containers/ChatPage";
import OfferRequestPage from "../containers/OfferRequestPage";
import LiveBidsPage from "./../containers/LiveBidsPage";
import AddUserPage from "./../containers/AddUserPage";
import EditUserPage from "./../containers/EditUserPage";
import ManageUsers from './../containers/ManageUsers';
export const dealerRoutes = [
  {
    path: "/dash",
    component: LiveBidsPage,
    exact: true,
  },
  {
    path: "/dash/chat",
    component: ChatPage,
    exact: true,
  },
  {
    path: "/dash/AddUser",
    component: AddUserPage,
  },
  ,
  {
    path: "/dash/createOfferRequest",
    component: OfferRequestPage,
    exact: true,
  },
  {
    path: "/dash/editUser",
    component: EditUserPage,
    exact: true,
  },
  {
    path: "/dash/manage",
    component: ManageUsers,
    exact: true,
  },
];

export const customerRoutes = [
  {
    path: "/dash",
    component: LiveBidsPage,
    exact: true,
  },
  {
    path: "/dash/chat",
    component: ChatPage,
    exact: true,
  },
  {
    path: "/dash/requestOffer",
    component: OfferRequestPage,
    exact: true,
  },
];
