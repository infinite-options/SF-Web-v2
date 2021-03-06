import React, { useState, useEffect } from 'react';
import LoadingOverlay from 'react-loading-overlay';

// import { Box } from '@material-ui/core';
import CheckoutRight from './CheckoutStoreRight';
import CheckoutContext from './CheckoutContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// import storeContext from "customer/storeContext";
// import axios from "axios";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_STRIPE_PUBLIC_KEY_LIVE
    : process.env.REACT_APP_STRIPE_PUBLIC_KEY
);

export default function CheckoutPage() {
  const [paymentDetails, setPaymentDetails] = useState({
    amountPaid: 0,
    amountDue: 0,
    discount: 0,
    subtotal: 0,
    serviceFee: 1.5,
    deliveryFee: 5,
    driverTip: 0,
    taxes: 0,
  });
  const [purchaseMade, setPurchaseMade] = useState(0);
  // console.log(
  //   'In Checkout Page Production: ',
  //   process.env.NODE_ENV === 'production'
  // );
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [chosenCoupon, setChosenCoupon] = useState('');
  const [chosenCode, setChosenCode] = useState('');
  const [ambDis,setAmbDis] = useState(0)
  const [leftTabChosen, setLeftTabChosen] = useState(4);
  const [rightTabChosen, setRightTabChosen] = useState(0);
  // useEffect(() => {
  //   console.log(chosenCoupon);
  // }, [chosenCoupon]);

  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    addressVerified: true,
  });

  return (
    <>
      <CheckoutContext.Provider
        value={{
          paymentDetails,
          setPaymentDetails,
          paymentProcessing,
          setPaymentProcessing,
          leftTabChosen,
          setLeftTabChosen,
          rightTabChosen,
          setRightTabChosen,
          guestInfo,
          setGuestInfo,
          purchaseMade,
          setPurchaseMade,
          chosenCoupon,
          setChosenCoupon,
          chosenCode,
          setChosenCode,
          ambDis,
          setAmbDis,
        }}
      >
        <Elements stripe={stripePromise}>
          <LoadingOverlay
            active={paymentProcessing}
            spinner
            text="Processing Payment"
          />

          <CheckoutRight />
        </Elements>
      </CheckoutContext.Provider>
    </>
  );
}
