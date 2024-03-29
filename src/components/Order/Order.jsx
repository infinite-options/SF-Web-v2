import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, InputAdornment } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import appColors from '../../styles/AppColors';
import CssTextField from '../../utils/CssTextField';
import { AuthContext } from '../../auth/AuthContext';
import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete';
import BusiApiReqs from '../../utils/BusiApiReqs';
import Mymodal from '../Modal/Modal';
import SuccessModal from '../Modal/SuccessModal';
let modalProp = true;
let modalSample = '';
const BusiMethods = new BusiApiReqs();
const useStyles = makeStyles((theme) => ({
  authModal: {
    position: 'absolute',
    width: '500px',
    maxWidth: '100%',
  },
  infoSection: {
    width: '33.33%',
    justifyContent: 'center',
    fontSize: '20px',
  },
  infoImg: {
    //: 'flex-end',
    alignItems: 'center',
    height: '150px',
  },
}));

const Order = ({ ...props }) => {
  const [address, setAddress] = React.useState('');
  const [modalError, setModalErrorMessage] = useState('');
  const [modalSuccess, setModalSuccessMessage] = useState('');
  var guestProfile = {};
  // const classes = useStyles();
  const history = useHistory();
  const auth = useContext(AuthContext);

  // // For Guest Procedure
  // const [deliverylocation, setDeliverylocation] = useState('');
  const classes = useStyles();

  // const onFieldChange = (event) => {
  //   const { value } = event.target;
  //   setDeliverylocation(value);
  // };
  // const onFindProduceClicked = () => {
  //   const formatMessage =
  //     'Please use the following format: Address, City, State Zipcode';
  //   const locationProps = deliverylocation.split(',');
  //   if (locationProps.length !== 3) {
  //     createError(formatMessage);
  //     return;
  //   }
  //   const stateZip = locationProps[2].trim().split(' ');
  //   if (stateZip.length !== 2) {
  //     createError(formatMessage);
  //     return;
  //   }
  //   setError('');
  //   setErrorMessage('');

  //   // DONE: Save for guest checkout
  //   let address = locationProps[0].trim();
  //   let city = locationProps[1].trim();
  //   let state = stateZip[0].trim();
  //   let zip = stateZip[1].trim();

  //   FindLongLatWithAddr(address, city, state, zip).then((res) => {
  //     console.log('res: ', res);
  //     if (res.status === 'found') {
  //       const guestProfile = {
  //         longitude: res.longitude.toString(),
  //         latitude: res.latitude.toString(),
  //         address: address,
  //         city: city,
  //         state: state,
  //         zip: zip,
  //       };
  //       localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
  //       auth.setIsGuest(true);
  //       history.push('/store');
  //     } else {
  //       createError('Sorry, we could not find this location');
  //     }
  //   });
  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    // setCoordinates(latLng);
    let addr = value.split(',');
    console.log(results[0].place_id);
    const results1 = await geocodeByPlaceId(results[0].place_id);
    const array_fragment = results1[0].address_components;
    const zipCode1 = array_fragment[array_fragment.length - 1];
    const zipCode2 = array_fragment[array_fragment.length - 2];
    console.log(zipCode1, zipCode2);
    console.log(array_fragment);

    // const google_pack=new window.google.maps.places.Autocomplete(value);
    // const zipResult= await (google_pack);

    // =await fetch("api.postcodes.io/postcodes?lon="+latLng.lng+"&lat="+latLng.lat,
    // {
    //   "method":"GET"
    // }
    // );
    // console.log(zipResult.getPlace());
    guestProfile = {
      longitude: latLng.lng,
      latitude: latLng.lat,
      address: addr[0],
      city: addr[1],
      state: addr[2],
      zip: zipCode1.length === 5 ? zipCode1.long_name : zipCode2.long_name,
    };
    console.log(latLng);
    const res = await BusiMethods.getLocationBusinessIds(
      latLng.lng,
      latLng.lat
    );
    console.log(res.result);
    console.log(!res.result.length);

    modalProp = !res.result.length;
    console.log(modalProp);
    if (modalProp) {
      console.log(guestProfile);
      setModalErrorMessage({
        title: 'Still Growing…',
        body: 'Sorry, it looks like we don’t deliver to your neighborhood yet. Enter your email address and we will let you know as soon as we come to your neighborhood.',
      });
    } else {
      setModalSuccessMessage({
        title: 'Hooray!',
        body: 'Looks like we deliver to your address. Click the button below to see the variety of fresh organic fruits and vegetables we offer.',
      });
      localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
      auth.setIsGuest(true);
      // history.push('/store');

      console.log(guestProfile);
    }
  };

  // const searchAddress= async (res)=>{
  //   // console.log(value);
  //   // let addr=(value.split(','));
  //   // console.log(addr);
  //   // guestProfile.city=addr[1];
  //   // guestProfile.state=addr[2];
  //   // guestProfile.address=addr[1];
  //   // guestProfile.longitude=coordinates.lng;
  //   // guestProfile.latitude=coordinates.lat;

  //   (modalProp=(!(res.result.length)));
  //   console.log(res);
  //   // console.log(modalProp)
  //   if(modalProp){
  //     setModalErrorMessage({
  //       title:"Still Growing…",
  //       body:'Sorry, it looks like we don’t deliver to your neighborhood yet. Enter your email address and we will let you know as soon as we come to your neighborhood.'});
  //   }
  //   else{
  //     setModalSuccessMessage({title:"Hooray!",body:'Looks like we deliver to your address. Click the button below to see the variety of fresh organic fruits and vegetables we offer.'});
  //     localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
  //     auth.setIsGuest(true);}
  //   //   // alert("We deliver at your location");
  //   //   // localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
  //   //   //   auth.setIsGuest(true);
  //   //   //   history.push('/store');
  //   // }
  //   console.log(modalSample)

  // }
  const login = async () => {
    // const res= await BusiMethods.getLocationBusinessIds(coordinates.lng,coordinates.lat);
    // guestProfile = {
    //          longitude: coordinates.lng,
    //          latitude: coordinates.lat,
    //          // address: address,
    //          // city: city,
    //          // state: state,
    //          // zip: zip,
    //        };
    // localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
    // auth.setIsGuest(true);
    history.push('/store');
    //  localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
    //   auth.setIsGuest(true);
    //   history.push('/store');
    console.log(guestProfile);
  };

  const google = window.google;
  const searchOptions = {
    location: new google.maps.LatLng(37.2366, -121.887),
    radius: 15,
    types: ['address'],
  };

  const errorHandleModal = () => {
    setModalErrorMessage(null);
    setModalSuccessMessage(null);
  };

  const signUpClicked = () => {
    props.setIsLoginShown(false);
    setModalSuccessMessage(null);
    props.setIsSignUpShown(!props.isSignUpShown);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <div
      style={{
        backgroundColor: 'white',
        height: 'auto',
        marginTop: '30px',
        width: '100%',
      }}
    >
      {modalSuccess && (
        <SuccessModal
          title={modalSuccess.title}
          body={modalSuccess.body}
          onConfirm={login}
          onSign={signUpClicked}
          modalClear={errorHandleModal}
        ></SuccessModal>
      )}

      {modalError && (
        <Mymodal
          title={modalError.title}
          body={modalError.body}
          onConfirm={errorHandleModal}
        ></Mymodal>
      )}
      <div style={{ marginRight: 'auto', marginLeft: 'auto' }}>
        <h1
          style={{
            color: 'rgb(54,97,102)',
            float: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '5px',
            fontSize: '42px',
            fontWeight: 'bold',
          }}
        >
          Ready to Order?
        </h1>
      </div>
      <div style={{ marginRight: 'auto', marginLeft: 'auto' }}>
        <h3
          style={{
            color: 'rgb(251,132,0)',
            float: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '35px',
            fontSize: '24px',
          }}
        >
          Fresh Organic Produce Delivered
        </h3>
      </div>
      <div
        style={{
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '25px',
          marginTop: '30px',
        }}
      >
        <PlacesAutocomplete
          value={address}
          onChange={setAddress}
          onSelect={handleSelect}
          searchOptions={searchOptions}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading,
          }) => (
            <div>
              {/* <input style={{width:'300px',marginLeft:'auto',marginRight:'auto', display: 'block',height:'40px'}}{...getInputProps({ placeholder: "Search for your address" })} /> */}

              <CssTextField
                className={classes.margin}
                id="input-with-icon-textfield"
                size="small"
                placeholder="Search for your address"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon
                        style={{ color: 'rgb(74,124,133)' }}
                        aria-hidden="false"
                        aria-label="Enter delivery location"
                      />
                    </InputAdornment>
                  ),
                }}
                {...getInputProps({ placeholder: 'Search for your address' })}
                // style={{
                //   width: '500px',
                //   border: '2px solid' + appColors.secondary,
                //   borderRadius: '5px',
                //   left: '0%',
                // }}
                style={{
                  width: '500px',
                  maxWidth: '90%',
                  border: '2px solid' + appColors.secondary,
                  borderRadius: '5px',
                }}
              />

              {loading ? <div>...loading</div> : null}

              {suggestions.map((suggestion) => {
                const style = {
                  backgroundColor: suggestion.active
                    ? 'rgb(54,97,102)'
                    : 'rgb(226,234,236)',
                  width: suggestion.active ? '300px' : '300px',
                  marginLeft: suggestion.active ? 'auto' : 'auto',
                  marginRight: suggestion.active ? 'auto' : 'auto',
                  height: suggestion.active ? '50px' : '50px',
                  border: suggestion.active
                    ? '1px solid black'
                    : '1px solid black',
                  color: suggestion.active ? 'white' : 'black',

                  // float:suggestion.active ? 'right':'right'
                };

                return (
                  <div {...getSuggestionItemProps(suggestion, { style })}>
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          )}
        </PlacesAutocomplete>
      </div>
      <Button
        size="large"
        variant="contained"
        color="primary"
        onClick={handleSelect}
        style={{
          width: '300px',
          maxWidth: '100%',
          textTransform: 'none',
          float: 'center',
          color: 'white',
          borderRadius: '15px',
        }}
      >
        Shop local produce near me
      </Button>
      <div
        style={{
          width: '100%',
          float: 'right',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '25px',
        }}
      ></div>
      <div>{modalSample}</div>
    </div>
  );
};
export default Order;
