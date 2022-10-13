# USER_CONNECT

Payload: userId

# OFFER_REQUEST_CREATED

Payload: offerRequestData

client/src/components/OfferRequestForm/index.jsx line 169
preparedObj = {
...values,
manufacturer: selectedManufacturer,
year: selectedYear,
car: selectedCar,
model: selectedModel,
color: selectedColor,
vehicleId: selectedVehicleId,
userId: id,
};

# OFFER_CREATED

Payload: offerData (requestData)

client/src/containers/LiveBidsPage/index.jsx line 203
const requestData = {
requestId,
dealerId: userId,
bids,
dealerInformation: userData,
price: this?.state?.price,
};

# OFFER_ACCEPTED

Payload: offerId

# END_CAMPAIGN

Payload: userId & bidId

# REQUEST_OUT_THE_DOOR_PRICE

Payload: userId & offerId

# MARK_AS_READ

Payload: id (socket.user.id)

# GET_LAST_SEEN_LIST

Payload: id (socket.user.id)

# SET_LAST_SEEN

Payload: offerId & date

# MESSAGE_SEND

Payload: offerId & message
