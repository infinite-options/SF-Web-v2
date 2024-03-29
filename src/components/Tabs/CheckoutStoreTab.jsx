import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useElements, CardElement } from '@stripe/react-stripe-js';
import { useHistory } from 'react-router-dom';

import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, TextField, Button, Typography } from '@material-ui/core';
import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import AddIcon from '@material-ui/icons/Add';
import appColors from '../../styles/AppColors';
import CartItem from '../CheckoutItems/cartItem';
import storeContext from '../Store/storeContext';
import checkoutContext from '../CheckoutPage/CheckoutContext';
import PaymentTab from './PaymentTab';
// import PlaceOrder from '../CheckoutPage/PlaceOrder';
import Coupons from '../CheckoutItems/Coupons';
import MapComponent from '../MapComponent/MapComponent';
import { AuthContext } from '../../auth/AuthContext';
import FindLongLatWithAddr from '../../utils/FindLongLatWithAddr';
import BusiApiReqs from '../../utils/BusiApiReqs';
import { useConfirmation } from '../../services/ConfirmationService';
import ProductSelectContext from '../ProductSelectionPage/ProdSelectContext';
// import AdminLogin from '../LogIn/AdminLogin';
// import Signup from '../SignUp/Signup';
import AmbasadorModal from  '../Modal/AmbasadorModal';


import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

import PayPal from '../PaymentDetails/Paypal';
import StripeElement from '../PaymentDetails/StripeElement';

// import TermsAndConditions from './TermsAndConditions';
import Cookies from 'js-cookie';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

// import DeliveryInfoTab from './DeliveryInfoTab';
// import LocationSearchInput from '../../utils/LocationSearchInput';
// import { MyLocation, SettingsOverscanOutlined, StreetviewTwoTone } from '@material-ui/icons';

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },

  tipButton: {
    color: appColors.buttonText,
    height: '2rem',
    backgroundColor: ' ',
    '&:hover': {
      backgroundColor: '#ff8500',
    },
  },

  section: {
    borderBottom: '1px solid' + appColors.checkoutSectionBorder,
    marginBottom: '10px',
    paddingBottom: '10px',
  },

  button: {
    color: appColors.buttonText,
    marginBottom: '10px',
  },

  driverTipBox: {
    marginBottom: '10px',
    paddingBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  },

  label: {
    color: appColors.paragraphText,
    fontWeight: 300,
    letterSpacing: '0.025em',
  },

  element: {
    display: 'block',
    margin: '10px 0 20px 0',
    padding: '10px 14px',
    fontSize: '1em',
    fontFamily: 'Source Code Pro, monospace',
    boxShadow:
      'rgba(50, 50, 93, 0.14902) 0px 1px 3px, rgba(0, 0, 0, 0.0196078) 0px 1px 0px',
    border: 0,
    outline: 0,
    borderRadius: '4px',
    background: 'white',
  },

  buttonCheckout: {
    color: appColors.buttonText,
    width: '20rem',
    backgroundColor: '#ff8500',
  },

  termsAndConditions: {
    fontSize: '14px',
  },

  termsAndConditionsLink: {
    textDecoration: 'underline',
    '&:hover': {
      cursor: 'pointer',
    },
  },

  delivInstr: {
    width: '100%',
    minHeight: '2rem',
    maxHeight: '3rem',
    backgroundColor: 'white',
    color: 'black',
    fontSize: '15px',
    border: '1px solid ' + appColors.paragraphText,
    outline: appColors.secondary + ' !important',
    borderRadius: '5px',
    textAlign: 'left',
    fontFamily: 'Arial',
    resize: 'vertical',
  },

  showButton: {
    color: 'white',
  },
  notify: {
    fontSize: '18px',
    color: '#fc6f03',
    fontWeight: 'bold',
  },
}));

const CssTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: appColors.secondary,
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: appColors.secondary,
      },
    },
  },
})(TextField);

function listItem(item, store, productSelect) {
  // console.log("CartItems calling from checkout Store tab",item)
  return (
    <>
      <CartItem
        name={item.item_name}
        unit={item.item_unit}
        price={item.item_price}
        count={item.count}
        img={item.item_photo}
        isCountChangeable={true}
        business_uid={item.itm_business_uid}
        id={item.item_uid}
        key={item.item_uid}
        products = {store.products}
        cartItems = {store.cartItems}
        setCartItems = {store.setCartItems}
        cartTotal = {store.cartTotal}
        setCartTotal = {store.setCartTotal}
        farmDaytimeDict = {store.farmDaytimeDict}
        dayClicked = {store.dayClicked}
        farmsClicked = {productSelect.farmsClicked}
        categoriesClicked = {productSelect.categoriesClicked}
      />
    </>
  );
}

// TEST: Order confirmation for completed purchase
// TODO: Get Delivery and service fee from zone
// TODO: Add button to get to tab 4 of left side
export default function CheckoutTab(props) {
  // console.log("IN checkoutStoreTab")
  const history = useHistory();
  const classes = useStyles();

  const store = useContext(storeContext);
  const auth = useContext(AuthContext);
  const checkout = useContext(checkoutContext);
  const productSelect = useContext(ProductSelectContext);

  const confirm = useConfirmation();
  const BusiApiMethods = new BusiApiReqs();

  const [isInDay, setIsInDay] = useState(false);
  const [map, setMap] = React.useState(null);
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');

  // cartItems is a dictonary, need to convert it into an array
  // const [cartItems, setCartItems] = useState(getItemsCart());
  // Retrieve items from store context
  const [userInfo, setUserInfo] = useState(store.profile);

  const [detailsDisplayType, setDetailsDisplayType] = useState(true);
  const [paymentDisplayType, setPaymentDisplayType] = useState(true);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(true);
  const [addressDisplayType, setAddressDisplayType] = useState(true);
  const [isClickedLogin, setIsClickedLogin] = useState(true);
  const [isClickedSignUp, setIsClickedSignUp] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [locError, setLocError] = useState('');
  const [locErrorMessage, setLocErrorMessage] = useState('');

  const [deliveryInstructions, SetDeliveryInstructions] = useState(
    localStorage.getItem('deliveryInstructions') || ''
  );
  const [paymentType, setPaymentType] = useState('NONE');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [viewTermsAndConds, setViewTermsAndConds] = useState(false);
  const FavoritePost = [];

  const {
    setPaymentProcessing,
    setLeftTabChosen,
    paymentDetails,
    setPaymentDetails,
  } = checkout;

  function calculateSubTotal(items) {
    
    var result = 0;
    for (const item of items) {
      let isInDay = false;
      
      if (store.farmDaytimeDict[item['itm_business_uid']] != undefined) {
        
        store.farmDaytimeDict[item['itm_business_uid']].forEach((daytime) => {
         
          if (store.dayClicked === daytime) {
            
            isInDay = true;
          }
          
        });
      }
      isInDay ? (result += item.count * item.item_price) : (result = result);
    }
    
    return result;
  }

  function createLocError(message) {
    setLocError('Invalid Input');
    setLocErrorMessage(message);
  }

  const onCheckAddressClicked = () => {
    // console.log('Verifying longitude and latitude from Delivery Info');
    FindLongLatWithAddr(
      userInfo.address,
      userInfo.city,
      userInfo.state,
      userInfo.zip
    ).then((res) => {
      if (res.status === 'found') {
        BusiApiMethods.getLocationBusinessIds(res.longitude, res.latitude).then(
          (busiRes) => {
            if (busiRes.result && busiRes.result.length > 0) {
              if (busiRes.result[0].zone === store.profile.zone) {
                updateProfile(false, res.latitude, res.longitude);
              } else {
                confirm({
                  variant: 'danger',
                  catchOnCancel: true,
                  title: 'About to Clear Cart',
                  description:
                    "Thanks for updating your address. Please note if you click 'Yes' your cart will be cleared. Would you like to proceed?",
                })
                  .then(() => {
                    updateProfile(true, res.latitude, res.longitude);
                  })
                  .catch(() => {});
              }
            } else {
              confirm({
                variant: 'danger',
                catchOnCancel: true,
                title: 'Address Notification',
                description:
                  "We're happy to save your address. But please note, we are current not delivering to this address. Would you like to proceed?",
              })
                .then(() => {
                  updateProfile(true, res.latitude, res.longitude);
                })
                .catch(() => {});
            }
          }
        );
      } else {
        createLocError('Sorry, we could not find this Address');
      }
    });
  };

  function updateProfile(isZoneUpdated, lat, long) {
    const _userInfo = { ...userInfo };
    _userInfo.latitude = lat.toString();
    _userInfo.longitude = long.toString();
    setIsAddressConfirmed(true);
    store.setProfile(_userInfo);
    setLocError('');
    setLocErrorMessage('');
    if (isZoneUpdated) {
      localStorage.setItem('isProfileUpdated', store.profile.zone);
      // console.log('Zone should be updated');
      store.setFarmsClicked(new Set());
      store.setDayClicked('');
      localStorage.removeItem('selectedDay');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartItemsAvail');
    }
  }

  useEffect(() => {
    setIsAddressConfirmed(
      userInfo.address === store.profile.address &&
        userInfo.city === store.profile.city &&
        userInfo.zip === store.profile.zip &&
        userInfo.state === store.profile.state
    );
  }, [userInfo]);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email' && emailError !== '') {
      setEmailError('');
      setEmailErrorMessage('');
    }
    setUserInfo({ ...userInfo, [name]: value });
  };

  const onFieldGuestChange = (event) => {
    if (errorMessage !== '') resetError();
    const { name, value } = event.target;
    if (value === '') setPaymentType('NONE');
    setGuestInfo({ ...guestInfo, [name]: value });
  };

  function resetError() {
    setFirstNameError('');
    setLastNameError('');
    setPhoneError('');
    setEmailError('');
    setErrorMessage('');
  }

  // const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
  useEffect(() => {
    if (store.profile !== {}) {
      setUserInfo(store.profile);
    }
  }, [store.profile]);

  // useEffect(() => {
  //   setCartItems(getItemsCart());
  // }, [store.cartItems]);

  //console.log("this is lat and long", userInfo.latitude, userInfo.longitude)
  var days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  // TODO: Fee based on expected delivery day
  function loadFees() {
    if (store.expectedDelivery !== '') {
      const deliveryDay = store.expectedDelivery.split(',')[0];
      if (store.profile.zone !== '')
        axios
          .get(
            process.env.REACT_APP_SERVER_BASE_URI +
              'get_Fee_Tax/' +
              store.profile.zone +
              ',' +
              deliveryDay.toUpperCase()
          )
          .then((res) => {
            try {
              const deliveryFee =
                (parseFloat(res.data.result.delivery_fee) * 100) / 100;
              const serviceFee =
                (parseFloat(res.data.result.service_fee) * 100) / 100;
              if (deliveryFee !== undefined && serviceFee !== undefined) {
              }
              setOrigDeliveryFee(deliveryFee);
              setOrigServiceFee(serviceFee);
              setTaxRate(res.data.result.tax_rate)
            } catch {}
          })
          .catch((err) => {
            console.log(err);
            setOrigDeliveryFee(5);
            setOrigServiceFee(1.5);
            
          });
    }
  };

  useMemo(() => {
    loadFees();
  }, [store.profile.zone, store.expectedDelivery]);

  function getItemsCart() {
    let isEmpty = true;

    for (const k in store.productDict)
    {
      isEmpty = false;
      break;
    }

    if (isEmpty)
      return [];

    var result = [];
    for (const [key, value] of Object.entries(cartItems)) {
      var tempRes = store.productDict[key]
      tempRes['count'] = value['count']
      result.push(tempRes)      
      
    }
    return result;
  }

  const [origDeliveryFee, setOrigDeliveryFee] = useState(5);
  const [origServiceFee, setOrigServiceFee] = useState(1.5);

  // DONE: Add service fee
  // DONE: Add Delivery tip
  // DONE: apply promo to subtotal
  // DONE: make taxes not applied to the delivery fee
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  // const [subtotal, setSubtotal] = useState(calculateSubTotal(cartItems));
  const [subtotal, setSubtotal] = useState(calculateSubTotal(getItemsCart()));
  const [promoApplied, setPromoApplied] = useState(0);
  const [ambassadorDiscount, setAmbassadorDiscount] = useState(0);
  const [discountMessage,setDiscountMessage] = useState('')
  const [deliveryFee, setDeliveryFee] = useState(
    cartItems.length > 0 ? origDeliveryFee : 0
  );
  const [serviceFee, setServiceFee] = useState(
    cartItems.length > 0 ? origServiceFee : 0
  );
  const [driverTip, setDriverTip] = useState(2);

  const [total, setTotal] = useState(
    subtotal -
      promoApplied +
      deliveryFee +
      serviceFee +
      parseFloat(driverTip !== '' ? driverTip : 0) +
      tax
  );
  useEffect(() => {
    
    const total =
      subtotal > 0
        ? parseFloat(
            (
              subtotal -
              promoApplied +
              deliveryFee +
              serviceFee +
              tax +
              parseFloat(driverTip !== '' ? driverTip : 0) -
              ambassadorDiscount
            ).toFixed(2)
          )
        : 0;
    setTotal(total);
    setPaymentDetails((prev) => ({
      ...prev,
      discount: promoApplied,
    }));
  }, [subtotal, promoApplied, deliveryFee, driverTip, ambassadorDiscount]);

  useEffect(() => {
    setPaymentDetails((prev) => ({
      ...prev,
      amountDue: total,
    }));
  }, [total]);

  useEffect(() => {
    setSubtotal(calculateSubTotal(getItemsCart()));
    // setSubtotal(calculateSubTotal(cartItems));
    var tempTax = 0
    console.log("in cartitems@321 --",cartItems,typeof(cartItems))
    if(Object.keys(cartItems).length!=0){
      console.log("in cartitems@321 -- IN")
      if(Object.keys(store.productDict).length!=0){

        Object.entries(cartItems).map(([key,items])=>{
          var item = store.productDict[key]
          if(item.taxable==='TRUE'){
            console.log("in cartitems@321 -- Taxable",tempTax,taxRate,item.item_price)
            tempTax = Number(tempTax)+((Number(taxRate)/100.00)*Number(item.item_price)).toFixed(2)*items.count
            
          }
        })

      }
      
    
    
  }
  setTax(tempTax)
  }, [cartItems, store.dayClicked, store.products ]);

  useEffect(() => {
    
    setServiceFee(subtotal > 0 ? origServiceFee : 0);
    setPaymentDetails((prev) => ({
      ...prev,
      subtotal: subtotal,
    }));
  }, [subtotal, store.products]);

  useEffect(() => {
    setPaymentDetails((prev) => ({
      ...prev,
      deliveryFee: deliveryFee,
    }));
  }, [deliveryFee, store.products]);

  useEffect(() => {
    setPaymentDetails((prev) => ({
      ...prev,
      serviceFee: serviceFee,
    }));
  }, [serviceFee, store.products]);

  useEffect(() => {
    setPaymentDetails((prev) => ({
      ...prev,
      driverTip: parseFloat(driverTip),
    }));
  }, [driverTip, store.products]);

  useEffect(() => {
    setPaymentDetails((prev) => ({
      ...prev,
      taxes: tax,
    }));
  }, [tax, store.products]);

  function onAddItemsClicked() {
    store.setStorePage(0);
    const items = Object.values(cartItems).map((item) => {
      return {
        qty: item.count,
        name: item.name,
        price: item.price,
        item_uid: item.id,
        itm_business_uid: item.business_uid,
      };
    });
  }

  function handleChangeAddress() {
    setAddressDisplayType(!addressDisplayType);
  }

  const onDeliveryInstructionsChange = (event) => {
    const { value } = event.target;
    SetDeliveryInstructions(value);
    localStorage.setItem('deliveryInstructions', value);
  };

  const { guestInfo, setGuestInfo } = useContext(checkoutContext);

  const { profile } = useContext(storeContext);

  var uid = null
  if(Cookies.get('customer_uid')!=null){
    var CryptoJS = require("crypto-js");
    var bytes = CryptoJS.AES.decrypt(Cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
    uid = bytes.toString(CryptoJS.enc.Utf8);
    console.log("working on encryption",uid)

  }

  let reqBodyPost = {
    customer_uid: uid,
    favorite: FavoritePost,
  };

  const postRequest = async () => {
    try {
      const response = await axios.post(
        BASE_URL + 'favorite_produce/post',
        reqBodyPost
      );
    } catch (err) {
      console.log(err.response || err);
    }
  };

  async function onPayWithClicked(type) {
    if (paymentDetails.amountDue > 0) {
      // check guest fields to make sure they are not empty
      if (!auth.isAuth) {
        let hasFirstName = true;
        let hasLastName = true;
        let hasPhone = true;
        let hasEmail = true;
        if (guestInfo.firstName === '') {
          setFirstNameError('Empty');
          hasFirstName = false;
        }
        if (guestInfo.lastName === '') {
          setLastNameError('Empty');
          hasLastName = false;
        }
        if (guestInfo.phoneNumber === '') {
          setPhoneError('Empty');
          hasPhone = false;
        }
        if (guestInfo.email === '') {
          setEmailError('Empty');
          hasEmail = false;
        }
        if (!hasFirstName || !hasLastName || !hasPhone || !hasEmail) {
          setErrorMessage(
            'Please provide all contact information to complete purchase'
          );
          return;
        }

        resetError();
        const updatedProfile = { ...profile };
        updatedProfile.firstName = guestInfo.firstName;
        updatedProfile.lastName = guestInfo.lastName;
        updatedProfile.phoneNum = guestInfo.phoneNumber;
        updatedProfile.email = guestInfo.email;
        store.setProfile(updatedProfile);
      }
      setPaymentType(type);

      for (let i = 0; i < store.products.length; i++) {
        if (store.products[i].favorite === 'TRUE') {
          FavoritePost.push(store.products[i].item_name);
        }
      }
      postRequest();
    } else {
      var alert_uid = '701-000005';
      await BusiApiMethods.getAlert(alert_uid);
      //alert('Please add items to your card before processing payment');
    }
  }

  const [myValue, setValue] = useState('')
  const [ambassadorModal, setAmbassadorModal] = useState(false)

//  const ambassadorEmail = document.getElementById("email").value
useMemo(()=> {
 
  let reqBodyAmbassadorPost = {
    code:  myValue,
    info: auth.isAuth ? userInfo.email : userInfo.address.concat(',').concat(userInfo.city).concat(',').concat(userInfo.state).concat(',').concat(userInfo.zip), //document.getElementById("email").value,
    IsGuest:auth.isAuth ? "False" : "TRUE",
  };

  const postAmbassadorRequest = async() => {
    // console.log("ambassador", reqBodyAmbassadorPost)
    try{
      setTotal(subtotal -
        promoApplied +
        deliveryFee +
        serviceFee +
        parseFloat(driverTip !== '' ? driverTip : 0) +
        tax)
    const response = await axios.post(BASE_URL + 'brandAmbassador/discount_checker', reqBodyAmbassadorPost )
    
    setAmbassadorDiscount(0)

    if(response.data.code != 200){
      setDiscountMessage(response.data.message)
      setAmbassadorDiscount(0)
      console.log("in ambassador",discountMessage)
      throw 'no discount'
    }
    console.log("subtotal is ",subtotal,response.data.sub.threshold)
    if(response.data.sub.coupon_id === 'SFGiftCard'){
      setDiscountMessage('')
      const disAmt = response.data.sub.discount_amount
      console.log("in ambassador",total,disAmt,total-disAmt)
      setAmbassadorDiscount(subtotal-disAmt<0?subtotal:disAmt)
      if(response.data.uids.length>1){
        checkout.setChosenCode(response.data.uids[1])
      }
      else{
        checkout.setChosenCode(response.data.uids[0])
      }
      
      checkout.setAmbDis(subtotal-disAmt<0?subtotal:disAmt)
      console.log("in ambassador",checkout.chosenCode)

    }
    else{
      if(response.data.sub.threshold>subtotal){
        setDiscountMessage('Subtotal should be greater than $'+response.data.sub.threshold)
      }
      else{
        setDiscountMessage('')
        const disAmt = response.data.sub.discount_amount
        console.log("in ambassador",total,disAmt,total-disAmt)
        setAmbassadorDiscount(subtotal-disAmt<0?subtotal:disAmt)
        if(response.data.uids.length>1){
          checkout.setChosenCode(response.data.uids[1])
        }
        else{
          checkout.setChosenCode(response.data.uids[0])
        }
        checkout.setAmbDis(subtotal-disAmt<0?subtotal:disAmt)
        console.log("in ambassador",checkout.chosenCode)

      }
      console.log("in cst",checkout.ambDis)
    }
    


      }catch(err) {
        checkout.setChosenCode('')
        checkout.setAmbDis(0)
        console.log(err.response || err);
      }
    };

  postAmbassadorRequest();
},[myValue,subtotal])


  


  return (
    <Box
      className="responsive-checkout-tab"
      display="flex"
      flexDirection="column"
    >
      {/* START: Expected Delivery */}
      {/* <TermsAndConditions opened={viewTermsAndConds} /> */}

      <Box hidden={store.expectedDelivery !== ''} m={2} />
      <Box hidden={store.expectedDelivery === ''}>
        <Box
          display="flex"
          flexDirection="column"
          id="responsiveExpectedDelivery"
        >
          <Box
            color={appColors.primary}
            fontSize="18px"
            textAlign="left"
            fontWeight="700"
          >
            Expected Delivery
          </Box>
          <Box fontSize="14px" fontWeight="bold" textAlign="left">
            {store.expectedDelivery}
          </Box>
        </Box>
      </Box>
      {/* END: Expected Delivery */}

      <Box
        display="flex"
        justifyContent="space-between"
        fontWeight="700"
        fontSize="16px"
      >
        <Box fontSize="18px" color={appColors.primary} mb={2}>
          Delivery Address
        </Box>
        <Box hidden={!auth.isAuth}>
          <Button
            style={{ color: '#ff8500', fontSize: '10px', fontWeight: 'bold' }}
            onClick={handleChangeAddress}
          >
            Change delivery Address
          </Button>
        </Box>
      </Box>

      <Box hidden={!addressDisplayType || !auth.isAuth}>
        <Box
          fontSize="14px"
          fontWeight="bold"
          marginBottom="1rem"
          className={classes.info}
          textAlign="Left"
          hidden={
            userInfo.address == '' &&
            userInfo.unit == '' &&
            userInfo.city == '' &&
            userInfo.state == '' &&
            userInfo.zip == ''
          }
        >
          {userInfo.address}
          {userInfo.unit === '' ? ' ' : ''}
          {userInfo.unit}, {userInfo.city}, {userInfo.state} {userInfo.zip}
        </Box>
      </Box>

      <Box hidden={addressDisplayType && auth.isAuth}>
        <Box display="flex" mb={1}>
          <CssTextField
            error={locError}
            value={userInfo.address}
            name="address"
            label="Street Address"
            variant="outlined"
            size="small"
            fullWidth
            onChange={onFieldChange}

          />
        </Box>

        <Box mb={1}>
          <CssTextField
            value={userInfo.unit}
            name="unit"
            label="Apt Number"
            variant="outlined"
            size="small"
            fullWidth
            onChange={onFieldChange}
          />
        </Box>

        <Box display="flex" mb={1}>
          <Box width="33.3%">
            <CssTextField
              value={userInfo.city}
              name="city"
              label="City"
              variant="outlined"
              size="small"
              fullWidth
              onChange={onFieldChange}
            />
          </Box>

          <Box width="33.3%" mx={1}>
            <CssTextField
              value={userInfo.state}
              name="state"
              label="State"
              variant="outlined"
              size="small"
              fullWidth
              onChange={onFieldChange}
            />
          </Box>

          <Box width="33.3%">
            <CssTextField
              value={userInfo.zip}
              name="zip"
              label="Zip Code"
              variant="outlined"
              size="small"
              fullWidth
              onChange={onFieldChange}
            />
          </Box>
        </Box>

        <Box hidden={isAddressConfirmed} mb={3}>
          <Button
            className={classes.Checkoutbutton}
            variant="outlined"
            size="small"
            color="paragraphText"
            onClick={onCheckAddressClicked}
          >
            Verify Address
          </Button>
        </Box>

        <MapComponent
          latitude={userInfo.latitude}
          longitude={userInfo.longitude}
        />
      </Box>

      <Box>
        <Box mb={1} mt={0.5} justifyContent="center">
          <textarea
            value={deliveryInstructions}
            onChange={onDeliveryInstructionsChange}
            className={classes.delivInstr}
            type=" "
            placeholder="Delivery instructions (ex: gate code. leave on porch)"
          />
        </Box>
      </Box>

      {/* START: Order Items */}
      <Box>
        <Box display="flex" paddingTop="1rem" className={classes.section}>
          <Box fontWeight="bold" lineHeight={1.8} fontSize="20px">
            Your Order:
          </Box>
          <Box flexGrow={1} />
          <Button
            className={classes.button}
            size="small"
            variant="contained"
            color="primary"
            onClick={onAddItemsClicked}
            style={{ borderRadius: '24px' }}
          >
            <AddIcon fontSize="small" />
            Add Items
          </Button>
        </Box>

        <Box my={1} px={1}>
          {getItemsCart().map((item) => listItem(item, store, productSelect))}
        </Box>

        <Box display="flex" paddingTop="2rem">
          <Box fontWeight="700" fontSize="22px">
            Subtotal
          </Box>
          <Box flexGrow={1} />
          <Box>${subtotal.toFixed(2)}</Box>
        </Box>

        <Box flexGrow={1} />
      </Box>
      {/* END: Order Items */}

      {/* START: Coupons */}
      <Coupons
        setDeliveryFee={setDeliveryFee}
        setPromoApplied={setPromoApplied}
        subtotal={subtotal}
        originalDeliveryFee={origDeliveryFee}
        classes={classes}
        styles={{display: 'inline-block'}}
      />
      {/* END: Coupons */}

      {/* START: Pricing */}
      <Box className={classes.section} display="flex">
        <Box color={appColors.secondary}>Promo Applied</Box>
        <Box flexGrow={1} />
        <Box>-${promoApplied.toFixed(2)}</Box>
      </Box>
      <Box className={classes.section} display="flex">
        <Box>Service Fee</Box>
        <Box flexGrow={1} />
        <Box>${serviceFee.toFixed(2)}</Box>
      </Box>
      <Box className={classes.section} display="flex">
        <Box>Delivery Fee</Box>
        <Box flexGrow={1} />
        <Box>${deliveryFee.toFixed(2)}</Box>
      </Box>

      <Box fontWeight="700" marginBottom="1rem" display="flex">
        {' '}
        Driver Tip{' '}
      </Box>

      <Box className={classes.driverTipBox}>
        <Box
          style={{ display: 'flex', justifyContent: 'space-evenly', flex: '4' }}
        >
          <Button
            className={classes.tipButton}
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setDriverTip(0)}
            style={{
              borderRadius: '5px',
              textTransform: 'none',
              color: '#000000',
            }}
          >
            No Tip
          </Button>
          <Button
            className={classes.tipButton}
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setDriverTip(2)}
            style={{
              borderRadius: '5px',
              color: '#000000',
              backgroundColor: 'primary',
            }}
          >
            $2
          </Button>
          <Button
            className={classes.tipButton}
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setDriverTip(3)}
            style={{ borderRadius: '5px', color: '#000000' }}
          >
            $3
          </Button>
          <Button
            className={classes.tipButton}
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setDriverTip(5)}
            style={{ borderRadius: '5px', color: '#000000' }}
          >
            $5
          </Button>
        </Box>
        <Box width="4rem">
          <CurrencyTextField
            disabled={false}
            variant="standard"
            modifyValueOnWheel={false}
            value={driverTip}
            currencySymbol="$"
            minimumValue="0"
            outputFormat="string"
            decimalCharacter="."
            digitGroupSeparator=","
            onChange={(event, value) => {
              setDriverTip(value);
            }}
          ></CurrencyTextField>
        </Box>
      </Box>

      <Box className={classes.section} display="flex">
        <Box>Taxes</Box>
        <Box flexGrow={1} />
        <Box>${tax.toFixed(2)}</Box>
      </Box>
      <Box display="flex" mb={1} mt={1} >
     <TextField id="email" label="Outlined" 

            //  id="email"
            //  value={myValue}
              name="ambassador"
              label={discountMessage !== '' ?discountMessage :"Enter Ambassador Code"}
              variant="outlined"
              size="small"
              fullWidth
              onChange={event => setValue(event.target.value)}
             >
          Enter Ambassador Code
        </TextField>
        <Button onClick = {() => setAmbassadorModal(!ambassadorModal)} >
          <InfoOutlinedIcon
           style={{ color: appColors.secondary }}/>
        </Button>
        <Box hidden={!ambassadorModal}>
          <AmbasadorModal/>
          </Box>
        <Box mt={1}>
          -${ambassadorDiscount > 0 ? ambassadorDiscount.toFixed(2) : '0.00' }
        </Box>
      </Box>
      <Box className={classes.section} fontWeight="bold" display="flex">
        <Box>Total</Box>
        <Box flexGrow={1} />
        <Box>{total.toFixed(2)}</Box>
      </Box>
      {/* END: Pricing */}

      <Box display="flex" alignItems="center" flexDirection="column">
        <Box
          hidden={auth.isAuth}
          style={{ marginBottom: '1rem', justifyContent: 'center' }}
        >
          <Button
            className={classes.buttonCheckout}
            size="small"
            variant="contained"
            color="primary"
            onClick={() => {
              setDetailsDisplayType(!detailsDisplayType);
            }}
          >
            Proceed as Guest
          </Button>
        </Box>

        <Box hidden={auth.isAuth}>
          <p
            style={{
              color: appColors.secondary,
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            Already have an account?
          </p>
          <Button
            className={classes.buttonCheckout}
            size="small"
            variant="contained"
            color="primary"
            onClick={() => {
              store.setIsCheckoutLogin(!store.isCheckoutLogin);
            }}
          >
            Login
          </Button>
        </Box>

        <Box hidden={auth.isAuth} style={{ marginBottom: '1rem' }}>
          <p
            style={{
              color: appColors.secondary,
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            Save time and create an account?
          </p>
          <Button
            className={classes.buttonCheckout}
            size="small"
            variant="contained"
            color="primary"
            onClick={() => {
              store.setIsCheckoutSignUp(!store.isCheckoutSignUp);
            }}
          >
            SignUp
          </Button>
        </Box>
      </Box>

      <Box hidden={detailsDisplayType} marginBottom="2rem">
        <PaymentTab />
      </Box>

      <Box hidden={!auth.isAuth} mb={3}>
        <Box style={{ display: 'flex' }}>
          <FormControl component="fieldset">
            <FormGroup
              aria-label="position"
              row
              onClick={() => console.log('Clicky')}
            >
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  value="end"
                  control={<Checkbox color="primary" />}
                  labelPlacement="end"
                />
                <Typography className={classes.termsAndConditions}>
                  I’ve read and accept the{' '}
                  <a
                    className={classes.termsAndConditionsLink}
                    onClick={() => history.push('/terms-and-conditions')}
                  >
                    Terms and Conditions
                  </a>
                </Typography>
              </Box>
            </FormGroup>
          </FormControl>
        </Box>

        <Box hidden={paymentType !== 'PAYPAL' && paymentType !== 'NONE'}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
            <Button
              className={classes.buttonCheckout}
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onPayWithClicked('STRIPE')}
              disabled={!termsAccepted}
            >
              Pay with Stripe {paymentType !== 'NONE' ? 'Instead?' : ''}
            </Button>
          </Box>
        </Box>
        <Box hidden={paymentType !== 'STRIPE' && paymentType !== 'NONE'}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Button
              className={classes.buttonCheckout}
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onPayWithClicked('PAYPAL')}
              disabled={!termsAccepted}
            >
              Pay with PayPal {paymentType !== 'NONE' ? 'Instead?' : ''}
            </Button>
          </Box>
        </Box>
      </Box>
      <Box hidden={paymentType !== 'PAYPAL'} marginBottom="2rem">
        <PayPal
          value={paymentDetails.amountDue}
          deliveryInstructions={deliveryInstructions}
        />
      </Box>
      <Box hidden={paymentType !== 'STRIPE'}>
        {paymentType === 'STRIPE' && (
          <StripeElement
            deliveryInstructions={deliveryInstructions}
            setPaymentType={setPaymentType}
            classes={classes}
          />
        )}
      </Box>
    </Box>
  );
}
