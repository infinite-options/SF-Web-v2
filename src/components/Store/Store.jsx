import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import Cookies from 'universal-cookie';
import StoreNavBar from './StoreNavBar';
import { AuthContext } from '../../auth/AuthContext';
import storeContext from './storeContext';
import { Box } from '@material-ui/core';
import ProductSelectionPage from '../ProductSelectionPage';
import AuthUtils from '../../utils/AuthUtils';
import BusiApiReqs from '../../utils/BusiApiReqs';
// import { makeStyles } from '@material-ui/core/styles';

// const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const cookies = new Cookies();

const testDate = new Date();
const BusiMethods = new BusiApiReqs();

// const useStyles = makeStyles((theme) => ({
//   authModal: {
//     position: 'absolute',
//     width: '500px',
//   },
// }));

const fullDaysUpper = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// const isCurrentlyAccepting = (business) => {
//   const today = new Date('2020-12-29T22:00:00');
//   today.setDate(today + 1);
//   const lowerDay = business.z_delivery_day.replace(
//     /(\w)(\w*)/g,
//     (_, firstChar, rest) => firstChar + rest.toLowerCase()
//   );
//   if (fullDaysUpper[today.getDay()] === business.z_delivery_day) {
//     const acceptingHours = JSON.parse(business.business_accepting_hours);
//     const startTime = new Date('2020-12-15T' + acceptingHours[lowerDay][0]);
//     const endTime = new Date('2020-12-15T' + acceptingHours[lowerDay][1]);
//     return startTime < today && today < endTime;
//   }
//   return true;
// };

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const amPmTo24Hr = (time) => {
  if (time[2] !== 'a' && time[2] !== 'p') {
    time = '0' + time;
  }
  if (time[2] === 'a') {
    return time.substring(0, 2) + ':00';
  }
  if (time[2] === 'p') {
    return (parseInt(time.substring(0, 2)) + 12).toString() + ':00';
  }
};

const findWeekdayDates = () => {
  const result = {};
  // const today = new Date();
  const today = new Date(testDate.getTime());
  let i = 0;
  while (i < 7) {
    result[fullDaysUpper[today.getDay()]] = new Date(today);
    today.setDate(today.getDate() + 1);
    i += 1;
  }
  return result;
};

function useOutsideAlerter(ref) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        !ref.current.hidden
      ) {
        ref.current.hidden = true;
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}

const weekdayDatesDict = findWeekdayDates();

const Store = ({ ...props }) => {
  // console.log('IN store');
  const Auth = useContext(AuthContext);
  const auth = useContext(AuthContext);
  const location = useLocation();
  const history = useHistory();
  // const classes = useStyles();
  const [orderConfirmation, setOrderConfirmation] = useState(false);
  // const currenttime = setInterval(checkIfAccepting, 60000);

  const [loggingIn, setLoggingIn] = React.useState(false);
  const [signingUp, setSigningUp] = React.useState(false);
  const [checkingOut, setCheckingOut] = React.useState(false);

  const { profile, setProfile } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  // const [productsFruit, setProductsFruit] = useState([]);
  // const [productsVegetable, setProductsVegetable] = useState([]);
  // const [productsDessert, setProductsDessert] = useState([]);
  // const [productsGiftCard, setProductsGiftCard] = useState([]);

  const [productsLoading, setProductsLoading] = useState(true);

  const [isInDay, setIsInDay] = useState(false);
  const [productDict,setProductDict] = useState({})
  const [farmsList, setFarmsList] = useState([]);
  const [dayTimeDict, setDayTimeDict] = useState({});
  const [numDeliveryTimes, setNumDeliveryTimes] = useState(0);
  const [daytimeFarmDict, setDaytimeFarmDict] = useState({});
  const [farmDaytimeDict, setFarmDaytimeDict] = useState({});
  const [startDeliveryDate, setStartDeliveryDate] = useState(
    localStorage.getItem('startDeliveryDate') || ''
  );
  const [expectedDelivery, setExpectedDelivery] = useState(
    localStorage.getItem('expectedDelivery') || ''
  );
  const [farmsClicked, setFarmsClicked] = useState(new Set());
  const [dayClicked, setDayClicked] = useState(
    localStorage.getItem('selectedDay') || ''
  );
  const [acceptDayHour, setAcceptDayHour] = useState({});

  const [isLoginShown, setIsLoginShown] = useState(false); // checks if user is logged in
  const [isSignUpShown, setIsSignUpShown] = useState(false);
  const [isCheckoutLogin, setIsCheckoutLogin] = useState(false);
  const [isCheckoutSignUp, setIsCheckoutSignUp] = useState(false);
  const [productCategoriesDict, setProductCategoriesDict] = useState({});

  const loginWrapperRef = useRef(null);
  useOutsideAlerter(loginWrapperRef, setIsLoginShown);
  const signupWrapperRef = useRef(null);
  useOutsideAlerter(signupWrapperRef, setIsSignUpShown);

  useEffect(() => {
    localStorage.setItem('startDeliveryDate', startDeliveryDate);
  }, [startDeliveryDate]);

  useEffect(() => {
    localStorage.setItem('expectedDelivery', expectedDelivery);
  }, [expectedDelivery]);

  useEffect(() => {
    localStorage.setItem('selectedDay', dayClicked);
  }, [dayClicked]);

  useEffect(() => {
    // console.log('profile updated: ', profile.latitude);
    getBusinesses(profile.longitude, profile.latitude, { ...profile });
  }, [profile.latitude]);

  // Options for which page is showing
  const [storePage, setStorePage] = useState(
    parseInt(localStorage.getItem('currentStorePage') || '0')
  );
  const [cartClicked, setCartClicked] = useState(0);

  useEffect(() => {
    if (location.state !== undefined) {
      if (
        location.state.rightTabChosen !== undefined ||
        location.state.leftTabChosen !== undefined
      )
        setStorePage(1);
      if (location.state.storePage !== undefined)
        setStorePage(parseInt(location.state.storePage));
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('currentStorePage', storePage);
  }, [storePage]);

  // console.log('profile = ', profile, ' prof long = ', profile.longitude, ' profile.lat = ', profile.latitude);

  localStorage.setItem('currentStorePage', storePage);
  //const { cartTotal, setCartTotal } = useContext(AuthContext);

  const [cartTotal, setCartTotal] = useState(
    parseInt(localStorage.getItem('cartTotal') || '0')
  );

  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem('cartItems') || '{}')
  );

  // useEffect(() => {
  //   console.log('cartTotal: ', cartTotal);
  //   // localStorage.setItem('cartTotal', `${cartTotal}`);
  //   // localStorage.setItem('cartItems', JSON.stringify(cartItems));
  // }, [cartTotal, cartItems]);

  props.hidden = props.hidden !== null ? props.hidden : false;

  useEffect(() => {
    if (Auth.isAuth) {
      setProductsLoading(true);
      const AuthMethods = new AuthUtils();
      if(cookies.get('customer_uid')!=null){
        if(cookies.get('customer_uid').startsWith("100-")){
          console.log('working on encryption-- in if for cookies')
          localStorage.removeItem('currentStorePage');
          localStorage.removeItem('cartTotal');
          localStorage.removeItem('cartItems');
          localStorage.removeItem('cartItemsAvail');
          localStorage.clear();
          cookies.remove('login-session');
          cookies.remove('customer_uid');
          
          auth.setIsAuth(false);
          auth.setAuthLevel(0);
          history.push('/');
        }
    
      }
      AuthMethods.getProfile().then((authRes) => {
        // console.log('User profile and store items were retrieved');
        // console.log('authRes: ', authRes);
        const updatedProfile = {
          email: authRes.customer_email,
          firstName: authRes.customer_first_name,
          lastName: authRes.customer_last_name,
          pushNotifications:
            authRes.cust_notification_approval === 'TRUE' ? true : false,
          phoneNum: authRes.customer_phone_num,
          address: authRes.customer_address,
          unit: authRes.customer_unit,
          city: authRes.customer_city,
          state: authRes.customer_state,
          zip: authRes.customer_zip,
          deliveryInstructions: '',
          latitude: authRes.customer_lat,
          longitude: authRes.customer_long,
          zone: '',
          socialMedia: authRes.user_social_media || '',
        };
        setProfile(updatedProfile);
      });
    } else {
      const guestProfile = JSON.parse(localStorage.getItem('guestProfile'));
      if (guestProfile === null) {
        history.push('/');
        return;
      }

      const updatedProfile = {
        email: '',
        firstName: '',
        lastName: '',
        pushNotifications: false,
        phoneNum: '',
        address: guestProfile.address,
        unit: '',
        city: guestProfile.city,
        state: guestProfile.state,
        zip: guestProfile.zip,
        deliveryInstructions: '',
        latitude: guestProfile.latitude,
        longitude: guestProfile.longitude,
        zone: '',
        socialMedia: 'NULL',
      };
      setProfile(updatedProfile);
    }
  }, []);
  function getBusinesses(long, lat, updatedProfile) {
    if (long !== '' && lat !== '') {
      BusiMethods.getLocationBusinessIds(long, lat).then((busiRes) => {
        // dictionary: business id with delivery days
        // show all if nothing selected
        if (busiRes === undefined) {
          setProductsLoading(false);
          return;
        }
        if (busiRes.result === undefined) {
          setProductsLoading(false);
          return;
        }
        setProductsLoading(true);
        loadBusinesses(busiRes, updatedProfile);
      });
    }
  }

  // const checkIfAccepting = () => {
  //   const today = new Date();
  //   const dayString =
  //     months[today.getMonth()] +
  //     '&' +
  //     today.getDate() +
  //     '&' +
  //     months[today.getDay()] +
  //     '&';
  //   if (today) {
  //   }
  // };

  function loadBusinesses(busiRes, updatedProfile) {
    // console.log('Dict');
    // console.log('busiRes: ', busiRes);
    // console.log('profile = ', profile);
    const businessesRes = busiRes.result;
    const businessUids = new Set();
    const dateDict = {};
    const _farmList = [];
    const _dayTimeDict = {};
    const _daytimeFarmDict = {};
    const _farmDaytimeDict = {};
    const _acceptDayHour = {};
    // get a list of buiness UIDs for the next req and
    // the farms properties for the filter
    for (const business of businessesRes) {
      const today = testDate;
      // const today = new Date();
      const acceptDate = weekdayDatesDict[business.z_accepting_day];
      const deliveryDate = new Date(
        weekdayDatesDict[business.z_delivery_day].getTime()
      );
      const originalDeliveryDate = weekdayDatesDict[business.z_delivery_day];

      if (!_acceptDayHour[business.z_delivery_day]) {
        _acceptDayHour[business.z_delivery_day] =
          business.z_accepting_day.slice(0, 3) +
          ' ' +
          business.z_accepting_time;
      }

      if (sameDay(today, acceptDate)) {
        const acceptTimeComps = amPmTo24Hr(business.z_accepting_time).split(
          ':'
        );

        const acceptHour = acceptTimeComps[0];
        const acceptMinute = acceptTimeComps[1];
        const todayHour = today.getHours().toString();
        const todayMinute = today.getMinutes().toString();
        const acceptTime = Date.parse(
          '01/01/2020 ' + acceptHour + ':' + acceptMinute + ':00'
        );
        const todayTime = Date.parse(
          '01/01/2020 ' + todayHour + ':' + todayMinute + ':00'
        );
        if (todayTime > acceptTime) {
          deliveryDate.setDate(originalDeliveryDate.getDate() + 7);
        }
      } else if (acceptDate > deliveryDate) {
        deliveryDate.setDate(originalDeliveryDate.getDate() + 7);
      }
      // console.log(deliveryDate);

      if (!businessUids.has(business.z_biz_id))
        businessUids.add(business.z_biz_id);
      const id = business.z_biz_id;
      const day = business.z_delivery_day;
      const time = business.z_delivery_time;
      const date =
        months[deliveryDate.getMonth()] +
        '&' +
        deliveryDate.getDate() +
        '&' +
        day +
        '&' +
        time;

      // Put set of farms into a dictionary with day as key
      // Set for faster lookups when inserting
      if (!(date in _daytimeFarmDict)) {
        _daytimeFarmDict[date] = new Set();
        dateDict[date] = deliveryDate;
      }
      _daytimeFarmDict[date].add(id);

      if (!(day in _dayTimeDict)) {
        _dayTimeDict[day] = new Set();
      }
      _dayTimeDict[day].add(time);

      // Put set of days into a dictionary with farm id as key
      // Set for faster lookups when inserting
      if (!(id in _farmDaytimeDict)) {
        _farmDaytimeDict[id] = new Set();
        _farmList.push({
          id: id,
          name: business.business_name,
          image: business.business_image,
          zone: business.zone,
        });
        updatedProfile.zone = business.zone;
      }
      _farmDaytimeDict[id].add(date);
    }
    const dateTimeDateDict = {};

    // Check for rollover Dates and fill the later date if necessary
    for (const currDate in _daytimeFarmDict) {
      const dateComps = currDate.split('&');
      const dayTime = dateComps[2] + '&' + dateComps[3];

      if (!(dayTime in dateTimeDateDict)) {
        dateTimeDateDict[dayTime] = currDate;
      } else {
        const seenDate = dateTimeDateDict[dayTime];
        const fillDateString =
          dateDict[currDate] > dateDict[seenDate] ? currDate : seenDate;
        _daytimeFarmDict[fillDateString] = new Set([
          ..._daytimeFarmDict[dateTimeDateDict[dayTime]],
          ..._daytimeFarmDict[currDate],
        ]);
        _daytimeFarmDict[fillDateString].forEach((farmID) => {
          _farmDaytimeDict[farmID].add(fillDateString);
        });
      }
    }
    setNumDeliveryTimes(Object.keys(_daytimeFarmDict).length);
    setFarmsList(_farmList);
    setDayTimeDict(_dayTimeDict);
    setDaytimeFarmDict(_daytimeFarmDict);
    setFarmDaytimeDict(_farmDaytimeDict);
    setAcceptDayHour(_acceptDayHour);
    if (_farmList.length > 0 && updatedProfile.zone !== profile.zone) {
      // localStorage.removeItem('selectedDay');
      //  localStorage.removeItem('cartTotal');
      //  localStorage.removeItem('cartItems');
      setProfile(updatedProfile);
    }



    BusiMethods.getProduceByLocation(
      profile.longitude,
      
      profile.latitude
      // ['fruit', 'dessert', 'vegetable', 'other'],
      // Array.from(businessUids)
    ).then((itemRes) => {
      const _products = [];
      const _vegetable = [];
      const _fruit = [];
      const _dessert = [];
      const _giftCard = [];
      const itemDict = {};
      if (itemRes !== undefined) {
        for (const item of itemRes) {
          setProductsLoading(true);
          try {
            if (item.item_status === 'Active') {
              const namePriceDesc =
                item.item_name + item.item_price + item.item_desc;
              // Business Price
              const bPrice = item.business_price;

              // if we've seen the the item before, check its business pricing and, if needed, creation date to take the lowest business price
              if (namePriceDesc in itemDict) {
                const itemIdx = itemDict[namePriceDesc];

                // keeps a list of the items business_uid(s) with the business' associated pricing
                _products[itemIdx].business_uids[item.itm_business_uid] =
                  item.item_price;

                // checks for if the current iterated business has a lower price than the one previously seen
                if (bPrice < _products[itemIdx].lowest_price) {
                  // console.log(
                  //   'in comparing*********',
                  //   _products[itemIdx].item_uid,
                  //   item.item_uid
                  // );
                  _products[itemIdx].lowest_price = bPrice;
                  _products[itemIdx].lowest_price_business_uid =
                    item.itm_business_uid;
                  _products[itemIdx].item_uid = item.item_uid;
                  _products[itemIdx].item_photo = item.item_photo;
                  _products[itemIdx].business_price = item.business_price;
                }

                // If the price is the same, take the one that was created first
                if (
                  bPrice === _products[itemIdx].lowest_price &&
                  new Date(item.created_at) <
                    new Date(_products[itemIdx].created_at)
                )
                  _products[itemIdx].lowest_price_business_uid =
                    item.itm_business_uid;
                _products[itemIdx].item_uid = item.item_uid;
                _products[itemIdx].item_photo = item.item_photo;
                _products[itemIdx].business_price = item.business_price;
              } else {
                // If we haven't seen it push it into the dictionary just in case we see it again
                itemDict[namePriceDesc] = _products.length;
                item.business_uids = {
                  [item.itm_business_uid]: item.item_price,
                };
                item.lowest_price_business_uid = item.itm_business_uid;
                item.lowest_price = bPrice;

                // Push to products to have distinct products
                if(item.item_name.includes(':')){
                  // console.log("item working321",item.item_name,item.item_name.split(':'))
                  item.item_name = item.item_name.split(':')[0]
                }
                _products.push(item);

                if (item.item_type.toString() === 'vegetable') {
                  _vegetable.push(item);
                } else if (item.item_type.toString() === 'fruit') {
                  _fruit.push(item);
                } else if (item.item_type.toString() === 'giftcard') {
                   _giftCard.push(item);
                } else {
                  _dessert.push(item);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }

      var uid = null
      if(cookies.get('customer_uid')!=null){
        var CryptoJS = require("crypto-js");
        var bytes = CryptoJS.AES.decrypt(cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
        uid = bytes.toString(CryptoJS.enc.Utf8);
        console.log("working on encryption",uid)
    
      }

      BusiMethods.getFavorite(uid).then((itemRes) => {
        if (itemRes !== undefined) {
          for (const item of itemRes) {
            // console.log('Favorite get', item);

            for (let i = 0; i < _products.length; i++) {
              if (
                item.favorite_produce !== null &&
                item.favorite_produce.includes(_products[i].item_name)
              )
                _products[i].favorite = 'TRUE';
            }
          }
        }
      });

      // localStorage.setItem('products', JSON.stringify(_products.sort()));
      var dictProductTemp = {}
      for (const vals in _products){
        dictProductTemp[_products[vals]['item_uid']]=_products[vals]
      }
      setProductDict(dictProductTemp)
      setProducts(_products.sort());
      const productCategoriesDict = {};
      productCategoriesDict['vegetable'] = _vegetable.sort();
      productCategoriesDict['fruit'] = _fruit.sort();
      productCategoriesDict['dessert'] = _dessert.sort();
      productCategoriesDict['gift-card'] = _giftCard.sort();
      setProductCategoriesDict(productCategoriesDict);
      setProductsLoading(false);
    });
  }


  return (
    <div hidden={props.hidden}>
      <storeContext.Provider
        value={{
          checkingOut,
          setCheckingOut,
          loggingIn,
          setLoggingIn,
          signingUp,
          setSigningUp,
          cartTotal,
          setCartTotal,
          cartItems,
          setCartItems,
          profile,
          setProfile,
          products,
          productCategoriesDict,
          productsLoading,
          storePage,
          setStorePage,
          numDeliveryTimes,
          dayTimeDict,
          daytimeFarmDict,
          farmDaytimeDict,
          acceptDayHour,
          expectedDelivery,
          setExpectedDelivery,
          startDeliveryDate,
          setStartDeliveryDate,
          farmsClicked,
          setFarmsClicked,
          dayClicked,
          setDayClicked,
          cartClicked,
          setCartClicked,
          isInDay,
          setIsInDay,
          orderConfirmation,
          setOrderConfirmation,
          isCheckoutLogin,
          setIsCheckoutLogin,
          isCheckoutSignUp,
          setIsCheckoutSignUp,
          productDict,  
        }}
      >
        <Box>
          <StoreNavBar storePage={storePage} setStorePage={setStorePage} />
        </Box>
        <ProductSelectionPage farms={farmsList} />
      </storeContext.Provider>
    </div>
  );
};

export default Store;