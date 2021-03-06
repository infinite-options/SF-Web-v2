import React, { useMemo, useContext, useState } from 'react';
import { useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useHistory } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import appColors from '../../styles/AppColors';
import { onPurchaseComplete } from '../PurchaseComplete/onPurchaseComplete';
import useResponsiveFontSize from '../../utils/useResponsiveFontSize';
// import { useConfirmation } from '../../services/ConfirmationService';
import CssTextField from '../../utils/CssTextField';
import { AuthContext } from '../../auth/AuthContext';
import storeContext from '../Store/storeContext';
import checkoutContext from '../CheckoutPage/CheckoutContext';
import { makeStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
 
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
 
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -12,
  },
}));



const cookies = new Cookies();
const useOptions = () => {
  const fontSize = useResponsiveFontSize();
  const options = useMemo(
    () => ({
      style: {
        base: {
          fontSize,
          color: appColors.paragraphText,
          letterSpacing: '0.025em',
          fontFamily: 'Source Code Pro, monospace',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    }),
    [fontSize]
  );

  return options;
};
const StripeCheckout = (props) => {
  const timer = React.useRef();
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const history = useHistory();
  const store = useContext(storeContext);
  const checkout = useContext(checkoutContext);
  const elements = useElements();
  const stripe = useStripe();
  const options = useOptions();
  const [processing, setProcessing] = useState(false);
  const {
    profile,
    cartItems,
    startDeliveryDate,
  } = useContext(storeContext);
  

  const { paymentDetails, setPaymentProcessing, chosenCoupon, chosenCode, ambDis } =
    useContext(checkoutContext);
  
  var couponIds = ''
  
  if(chosenCoupon==='' && chosenCode===''){
    couponIds = ''
  }
  else if (chosenCoupon!='' && chosenCode!=''){
    couponIds = chosenCoupon+','+chosenCode
  }
  else{
    if(chosenCoupon==='' ){
      couponIds = chosenCode
    }
    else{
      couponIds = chosenCoupon
    }
  } 

  

  const onPay = async (event) => {
    event.preventDefault();

    setProcessing(true);
    
    const billingDetails = {
      name: profile.firstName + ' ' + profile.lastName,
      email: profile.email,
      address: {
        line1: profile.address,
        city: profile.city,
        state: profile.state,
        postal_code: profile.zip,
      },
    };
    let formSending = new FormData();
    formSending.append('amount', paymentDetails.amountDue);
    formSending.append('note', props.deliveryInstructions);
    try {
      const {
        data: { client_secret },
      } = await axios.post(
        process.env.REACT_APP_SERVER_BASE_URI + 'Stripe_Intent',
        formSending,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      var items = []
      for (const [key, vals] of Object.entries(JSON.parse(localStorage.getItem('cartItems')))) {
        var itemVals = {}
        console.log(localStorage.getItem('cartItemsAvail'),typeof(JSON.parse(localStorage.getItem('cartItemsAvail'))))
        console.log("OUT",key)
        if(JSON.parse(localStorage.getItem('cartItemsAvail'))[key]['isInDay']===true){
          console.log("IN",key)
        for (const valsInProduct in store.products){
          
          if(store.products[valsInProduct]['item_uid']===key){
            
            itemVals = store.products[valsInProduct]
            itemVals['count'] = vals['count']
          }
        } 
      
         items.push({
          qty: itemVals.count,
          name: itemVals.item_name,
          unit: itemVals.item_unit,
          price: itemVals.item_price,
          business_price: itemVals.business_price,
          item_uid: itemVals.item_uid,
          itm_business_uid: itemVals.itm_business_uid,
          description: itemVals.item_desc,
          img: itemVals.item_photo,
        })
      }
      }
      
      const cardElement = await elements.getElement(CardElement);

      // const IntentStripe = Stripe(
      //   process.env.NODE_ENV === 'production' &&
      //     props.deliveryInstructions !== 'SFTEST'
      //     ? process.env.REACT_APP_STRIPE_PRIVATE_KEY_LIVE
      //     : process.env.REACT_APP_STRIPE_PRIVATE_KEY
      // );

      // const centsAmount = parseInt(parseFloat(paymentDetails.amountDue) * 100);
      // const centsType = typeof centsAmount;
      // const paymentIntent = await IntentStripe.paymentIntents.create({
      //   amount: centsAmount,
      //   currency: 'usd',
      // });

      // const IntentStripe = Stripe('sk_test_fe99fW2owhFEGTACgW3qaykd006gHUwj1j');

      // const paymentIntent = await IntentStripe.paymentIntents.create({
      //   amount: 1099,
      //   currency: 'usd',
      //   payment_method_types: ['card'],
      // });

      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      const confirmed = await stripe.confirmCardPayment(client_secret, {
        payment_method: paymentMethod.paymentMethod.id,
      });
      //gathering data to send back our server
      //set start_delivery_date

      // DONE: for Guest, put 'guest' in uid
      // TODO: Add Pay coupon ID
      console.log("in stripe cst 2",ambDis)
      var uid = null
      if(cookies.get('customer_uid')!=null){
        var CryptoJS = require("crypto-js");
        var bytes = CryptoJS.AES.decrypt(cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
        uid = bytes.toString(CryptoJS.enc.Utf8);
        console.log("working on encryption",uid)
    
      }
      const data = {
        // pur_customer_uid: profile.customer_uid,
        pur_customer_uid: auth.isAuth ? uid : 'GUEST',
        pur_business_uid: 'WEB',
        items,
        order_instructions: '',
        delivery_instructions: props.deliveryInstructions,
        order_type: 'produce',
        delivery_first_name: profile.firstName,
        delivery_last_name: profile.lastName,
        delivery_phone_num: profile.phoneNum,
        delivery_email: profile.email,
        delivery_address: profile.address,
        delivery_unit: profile.unit,
        delivery_city: profile.city,
        delivery_state: profile.state,
        delivery_zip: profile.zip,
        delivery_latitude: auth.isAuth
          ? profile.latitude
          : profile.latitude.toString(),
        delivery_longitude: auth.isAuth
          ? profile.longitude
          : profile.longitude.toString(),
        purchase_notes: 'purchase_notes',
        start_delivery_date: startDeliveryDate,
        pay_coupon_id: couponIds,
        amount_due: paymentDetails.amountDue.toString(),
        amount_discount: paymentDetails.discount.toString(),
        amount_paid: paymentDetails.amountDue.toString(),
        info_is_Addon: 'FALSE',
        cc_num: paymentMethod.paymentMethod.card.last4,
        cc_exp_date:
          paymentMethod.paymentMethod.card.exp_year +
          '-' +
          paymentMethod.paymentMethod.card.exp_month +
          '-01 00:00:00',
        cc_cvv: 'NULL',
        cc_zip: 'NULL',
        charge_id: confirmed.paymentIntent.id,
        payment_type: 'STRIPE',
        delivery_status: 'FALSE',
        subtotal: paymentDetails.subtotal.toString(),
        service_fee: paymentDetails.serviceFee.toString(),
        delivery_fee: paymentDetails.deliveryFee.toString(),
        driver_tip: paymentDetails.driverTip.toString(),
        taxes: paymentDetails.taxes.toString(),
        ambassador_code:ambDis.toString(),
      };

      console.log('purchase_Data_SF data', data);
      axios
        .post(
          process.env.REACT_APP_SERVER_BASE_URI + 'purchase_Data_SF',
          data,

          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => {
          cardElement.clear();
          setProcessing(false);
          setPaymentProcessing(false);
          onPurchaseComplete({
            store: store,
            checkout: checkout,
          });
          store.setOrderConfirmation(true);
          history.push({
            pathname: '/store',
            state: { rightTabChosen: 2 },
          });
        })
        .catch((err) => {
          setProcessing(false);
          setPaymentProcessing(false);
          console.log(
            'error happened while posting to purchase_Data_SF api',
            err
          );
        });
    } catch (err) {
      setProcessing(false);
      setPaymentProcessing(false);
      console.log('error happened while posting to Stripe_Intent api', err);
    }
  };
  console.log("in stripe page",couponIds,ambDis)
  return (
    <>
      {/* <label className={props.classes.label}>
        Cardholder Name 
      </label> */}
      <Box mt={1}>
        <CssTextField
          label="Cardholder Name"
          variant="outlined"
          size="small"
          fullWidth
        />
      </Box>
      <Box mt={1}>
        {/* <label className={props.classes.label}>
          Enter Card details Below: */}
        <CardElement
          elementRef={(c) => (this._element = c)}
          className={props.classes.element}
          options={options}
        />
        {/* </label> */}
      </Box>
      <div className={classes.wrapper}>
        <Button
          //className={props.classes.buttonCheckout}
          variant="contianed"
          className={processing?'':classes.buttonSuccess}
          size="small"
          color="paragraphText"
          onClick={onPay}
          disabled={processing}
          
          style={{
            marginBottom: '2rem',
            color: appColors.buttonText,
            width: '20rem',
            backgroundColor: '#ff8500',
            display:processing?'none':'block',
          }}
        >
          Complete Payment with Stripe
        </Button>
        <div style={{height:'100px',display:!processing?'none':'block',}}>
          <b>Processing Payment</b>
          {processing && <CircularProgress size={50} className={classes.buttonProgress} />}
        </div>
      </div>
      
      
    </>
  );
};
export default StripeCheckout;
