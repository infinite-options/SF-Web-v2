import React, { useState, useContext } from 'react';
// import { Container, Row, Col } from 'react-grid-system';
import { useHistory } from 'react-router-dom';
// import { Visible, Hidden } from 'react-grid-system';
import {
  Box,
  // Box,
  Button,
  InputAdornment,
  // FormHelperText,
  // Collapse,
} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import appColors from '../../styles/AppColors';
import CssTextField from '../../utils/CssTextField';
// import FindLongLatWithAddr from '../utils/FindLongLatWithAddr';

// import { TrendingUpRounded } from '@material-ui/icons';
import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete';
import BusiApiReqs from '../../utils/BusiApiReqs';
import { AuthContext } from '../../auth/AuthContext';
import Mymodal from '../Modal/Modal';
import SuccessModal from '../Modal/SuccessModal';
// import TextField from '@material-ui/core/TextField';

// let google1=new google.maps;

let modalProp = true;
const BusiMethods = new BusiApiReqs();
const useStyles = makeStyles((theme) => ({
  authModal: {
    position: 'absolute',
    width: '500px',
    zIndex: '10040',
    height: 'auto',
    maxWidth: '100%'
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
  searchInput: {
    color: 'red'
  }
}));

// let guestProfile={
//   longitude: '',
//   latitude: '',
//   address: '',
//   city: '',
//   state: '',
//   zip: '',
// }
const DeliveryLocationSearch = ({ ...props }) => {
  const [address, setAddress] = React.useState('');
  // const [coordinates, setCoordinates] = React.useState({
  //   lat: null,
  //   lng: null
  // });
  const [modalError, setModalErrorMessage] = useState('');
  const [modalSuccess, setModalSuccessMessage] = useState('');
  let guestProfile = {};
  const classes = useStyles();
  const history = useHistory();
  const auth = useContext(AuthContext);

  // // For Guest Procedure
  // const [deliverylocation, setDeliverylocation] = useState('');
  // const [errorValue, setError] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');

  // function createError(message) {
  //   setError('Invalid Input');
  //   setErrorMessage(message);
  // }
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
      zip: zipCode1.length == 5 ? zipCode1.long_name : zipCode2.long_name,
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

  // const searchAddress= async value=>{
  //   // const results = await geocodeByAddress(value);
  //   // const latLng = await getLatLng(results[0]);
  //   // setAddress(value);
  //   // setCoordinates(latLng);
  //   let addr=this.setAddress;
  //   console.log(addr);

  //   guestProfile = {
  //                 longitude: coordinates.lng,
  //                 latitude: coordinates.lat,
  //   //               address: addr[0],
  //   //               city: addr[1],
  //   //               state: addr[2],
  //   //               zip: "",
  //               };
  //   console.log(setAddress);
  //   const res= await BusiMethods.getLocationBusinessIds(coordinates.lng,coordinates.lat);
  //   console.log(res.result);
  //   console.log(!(res.result.length));

  //   modalProp=(!(res.result.length));
  //   console.log(modalProp);
  //   if(modalProp){
  //     console.log(guestProfile);
  //     setModalErrorMessage({
  //     title:"Still Growing…",
  //     body:'Sorry, it looks like we don’t deliver to your neighborhood yet. Enter your email address and we will let you know as soon as we come to your neighborhood.'});
  //   }
  //   else{
  //     setModalSuccessMessage({title:"Hooray!",body:'Looks like we deliver to your address. Click the button below to see the variety of fresh organic fruits and vegetables we offer.'});
  //     localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
  //     auth.setIsGuest(true);
  //     // history.push('/store');

  //     console.log(guestProfile);
  //   }

  // }
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
    if (auth.isAuth) {
      history.push('/store');
    } else {
      alert('Please type in your address');
    }
    //  localStorage.setItem('guestProfile', JSON.stringify(guestProfile));
    //   auth.setIsGuest(true);
    //   history.push('/store');
    console.log(guestProfile);
  };
  const modalLogin = async () => {
    history.push('/store');
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

  // const options = {
  //   location: google1.LatLng(-34, 151),
  //   radius: 2000,
  //   types: ['address']

  // }
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center"
      style={{
        // border: 'solid lime',
        maxWidth: '96%'
      }}
    >
      {modalError && (
        <Mymodal
          title={modalError.title}
          body={modalError.body}
          onConfirm={errorHandleModal}
        ></Mymodal>
      )}
      {modalSuccess && (
        <SuccessModal
          title={modalSuccess.title}
          body={modalSuccess.body}
          onConfirm={modalLogin}
          onSign={signUpClicked}
          modalClear={errorHandleModal}
        ></SuccessModal>
      )}
      <Box
        style={{
          // border: 'solid cyan'
          width: '100%'
        }}
      >
        <div
          style={{
            // border: 'solid orange',
            width: '100%'
          }}
        >
          <PlacesAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={handleSelect}
            style={{
              // border: 'solid violet',
              // color: 'red',
              width: '100%'
            }}
            // options={options}
            searchOptions={searchOptions}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div
                style={{
                  // border: 'dashed',
                  width: '100%',
                  // color: 'red'
                }}
              >
                <CssTextField
                  className={classes.margin}
                  id="input-with-icon-textfield_top"
                  size="small"
                  placeholder="Search for your address"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment 
                        position="start"
                        // style={{
                        //   color: 'red'
                        // }}
                      >
                        <LocationOnIcon
                          style={{ 
                            color: 'rgb(74,124,133)'
                          }}
                          aria-hidden="false"
                          aria-label="Enter delivery location"
                        />
                      </InputAdornment>
                    ),
                  }}
                  {...getInputProps({ 
                    placeholder: 'Search for your address',
                    className: 'searchInput'
                  })}
                  style={{
                    width: '50%',
                    height: '80%',
                    maxWidth: '90%',
                    border: '2px solid' + appColors.secondary,
                    borderRadius: '5px',
                    // display: 'flex',
                    // alignItems: 'center'
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
                    zIndex: suggestion.active ? '1000' : '1000',
                    position: suggestion.active ? 'active' : 'active',
                    left: suggestion.active ? '00%' : '0%',
                    // float:suggestion.active?'right':'right'

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
      </Box>
      <Box>
        <Button
          value={address}
          size="large"
          variant="contained"
          color="primary"
          onClick={login}
          style={{
            width: '300px',
            maxWidth: '90%',
            textTransform: 'none',
            borderRadius: '20px',
            marginTop: '20px',
            textAlign: 'center',
            font: ' normal normal medium 32px/26px SF Pro Display',
            letterSpacing: '0.51px',
            color: '#FFFFFF',
            opacity: 1,
          }}
        >
          Shop local produce near me
        </Button>
      </Box>
    </Box>
  );
};
export default DeliveryLocationSearch;
