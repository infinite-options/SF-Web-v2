import axios from 'axios';
import Cookies from 'universal-cookie';

export default class AuthUtils {
  BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
  cookies = new Cookies();

  getProfile = async function () {
    var uid = null
    if(this.cookies.get('customer_uid')!=null){
      var CryptoJS = require("crypto-js");
      var bytes = CryptoJS.AES.decrypt(this.cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
      uid = bytes.toString(CryptoJS.enc.Utf8);
      console.log("working on encryption",uid)
  
    }
    return await axios
      .get(this.BASE_URL + 'Profile/' + uid)
      .then((response) => {
        if (response.data.result.length !== 0)
          return Promise.resolve(response.data.result[0]);
        else return Promise.resolve({});
      })
      .catch((err) => {
        console.log(err.response || err);
      });
  };

  createProfile = async function (userInfo, password) {
    let object = {
      email: userInfo.email,
      password: password,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      phone_number: userInfo.phoneNum,
      address: userInfo.address,
      unit: userInfo.unit,
      city: userInfo.city,
      state: userInfo.state,
      zip_code: userInfo.zip,
      latitude: userInfo.latitude.toString(),
      longitude: userInfo.longitude.toString(),
      referral_source: 'WEB',
      role: 'CUSTOMER',
      social: 'FALSE',
      social_id: 'NULL',
      user_access_token: 'FALSE',
      user_refresh_token: 'FALSE',
      mobile_access_token: 'FALSE',
      mobile_refresh_token: 'FALSE',
    };
    console.log('object', object);
    return await axios

      .post(process.env.REACT_APP_SERVER_BASE_URI + 'createAccount', object, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((res) => {
        try {
          if (res.data.code >= 200 && res.data.code < 300) {
            let customerInfo = res.data.result;
            this.cookies.set('login-session', 'good');
            console.log("working on encryption--first")
            this.cookies.set('customer_uid', customerInfo.customer_uid);
            
            var CryptoJS = require("crypto-js");
            console.log("working on encryption--in")
            var ciphertext = CryptoJS.AES.encrypt(customerInfo.customer_uid, process.env.REACT_APP_UID_ENCRYPT_CODE).toString();
            this.cookies.set('customer_uid', ciphertext);

            
            if (res.data.code === 200) {
              axios
                .post(
                  process.env.REACT_APP_SERVER_BASE_URI + 'email_verification',
                  { email: userInfo.email },
                  {
                    headers: {
                      'Content-Type': 'text/plain',
                    },
                  }
                )
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  if (err.response) {
                    console.log(err.response);
                  }
                  console.log(err);
                });
            }
            return Promise.resolve({ code: 200 });
          } else {
            return Promise.resolve({ code: 400 });
          }
        } catch {
          return Promise.resolve({ code: 400 });
        }
      })
      .catch((err) => {
        console.log('Update Profile Error: ', err.response || err);
        return Promise.resolve({ code: 400 });
      });
  };

  updateProfile = async function (profile) {
    var uid = null
    if(this.cookies.get('customer_uid')!=null){
      var CryptoJS = require("crypto-js");
      var bytes = CryptoJS.AES.decrypt(this.cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
      uid = bytes.toString(CryptoJS.enc.Utf8);
      console.log("working on encryption",uid)
  
    }
    const profileData = {
      customer_first_name: profile.firstName,
      customer_last_name: profile.lastName,
      customer_phone_num: profile.phoneNum,
      customer_email: profile.email,
      customer_address: profile.address,
      customer_unit: profile.unit,
      customer_city: profile.city,
      customer_state: profile.state,
      customer_zip: profile.zip,
      customer_lat: profile.latitude,
      customer_long: profile.longitude,
      customer_uid: uid,
    };

    return await axios
      .post(this.BASE_URL + 'update_Profile', profileData, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => {
        if (response.data) {
          if (response.data.code >= 200 && response.data.code < 300)
            return Promise.resolve({ code: 200 });
          else {
            return Promise.resolve({ code: 400 });
          }
        } else {
          return Promise.resolve({ code: 400 });
        }
      })
      .catch((err) => {
        console.log('Update Profile Error: ', err.response || err);
        return Promise.resolve({ code: 400 });
      });
  };

  updatePassword = async function (credentials) {
    var uid = null
    if(this.cookies.get('customer_uid')!=null){
      var CryptoJS = require("crypto-js");
      var bytes = CryptoJS.AES.decrypt(this.cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
      uid = bytes.toString(CryptoJS.enc.Utf8);
      console.log("working on encryption",uid)
  
    }
    credentials.customer_uid = uid;
    return await axios
      .post(this.BASE_URL + 'update_email_password', credentials, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then((response) => {
        if (response.data) {
          if (response.data.code >= 200 && response.data.code < 300)
            return Promise.resolve({ code: 200 });
          else {
            return Promise.resolve({ code: 400 });
          }
        } else {
          return Promise.resolve({ code: 400 });
        }
      })
      .catch((err) => {
        console.log('Update Profile Error: ', err.response || err);
        return Promise.resolve({ code: 400 });
      });
  };

  updatePushNotifications = async function (notificationValue) {
    var uid = null
    if(this.cookies.get('customer_uid')!=null){
      var CryptoJS = require("crypto-js");
      var bytes = CryptoJS.AES.decrypt(this.cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
      uid = bytes.toString(CryptoJS.enc.Utf8);
      console.log("working on encryption",uid)
  
    }
    const notificationData = {
      uid: uid,
      notification: notificationValue ? 'TRUE' : 'FALSE',
    };

    return await axios
      .post(
        this.BASE_URL + 'update_guid_notification/customer,update',
        notificationData,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      )
      .then((response) => {
        if (response.data) {
          if (response.data.code >= 200 && response.data.code < 300)
            return Promise.resolve({ code: 200 });
          else {
            return Promise.resolve({ code: 400 });
          }
        } else {
          return Promise.resolve({ code: 400 });
        }
      })
      .catch((err) => {
        console.log('Update Profile Error: ', err.response || err);
        return Promise.resolve({ code: 400 });
      });
  };

  getLastDeliveryDate = async function (notificationValue) {
    var uid = null
    if(this.cookies.get('customer_uid')!=null){
      var CryptoJS = require("crypto-js");
      var bytes = CryptoJS.AES.decrypt(this.cookies.get('customer_uid'), process.env.REACT_APP_UID_ENCRYPT_CODE);
      uid = bytes.toString(CryptoJS.enc.Utf8);
      console.log("working on encryption",uid)
  
    }
    return await axios
      .get(
        this.BASE_URL +
          'last_delivery_instruction/' +
          uid
      )
      .then((response) => {
        try {
          if (response.data) {
            if (response.data.code >= 200 && response.data.code < 300)
              return Promise.resolve(
                response.data.result[0].delivery_instructions
              );
            else {
              return Promise.resolve('');
            }
          } else {
            return Promise.resolve('');
          }
        } catch {
          return Promise.resolve('');
        }
      });
  };
}
