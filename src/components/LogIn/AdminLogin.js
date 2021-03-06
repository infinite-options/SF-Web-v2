import React, { useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { withRouter } from 'react-router';
import axios from 'axios';
import { Grid, Paper, Button, Typography, Box } from '@material-ui/core';
import { AuthContext } from '../../auth/AuthContext';
import CssTextField from '../../utils/CssTextField';
import appColors from '../../styles/AppColors';
import SocialLogin from './SocialLogin';
import InputAdornment from '@material-ui/core/InputAdornment';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import EmailModal from './emailModal';
import PassModal from './passwordModal';
import IncorrectPasswordModal from './incorrectPasswordModal';
import SocialLoginErrorModal from './SocialLoginError';
const API_URL = process.env.REACT_APP_SERVER_BASE_URI + '';

// TODO: if farmer default to home page
function AdminLogin({ ...props }) {
  const [emailValue, setEmail] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [passwordValue, setPassword] = useState('');
  const [errorValue, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setemailError] = useState();
  const [passwordError, setpasswordError] = useState();
  const [socialError, setsocialError] = useState();
  const [passVisible, setPassvisble] = React.useState({
    password: '',
    showPassword: false,
  });
  const [passModal, setpassModal] = useState();
  const Auth = useContext(AuthContext);

  const handleClickShowPassword = () => {
    setPassvisble({ ...passVisible, showPassword: !passVisible.showPassword });
  };

  const onReset = async (value) => {
    axios
      .post(API_URL + 'set_temp_password', { email: emailValue })
      .then((response) => {
        let res = response;
        if (res.data.message === 'A temporary password has been sent') {
          // console.log(res);
          setpassModal(true);
        } else if (res.data.code === 280) {
          // console.log(res);
          alert('No account found with that email.');
        }
      });
  };
  useEffect(() => {
    if (
      process.env.REACT_APP_APPLE_CLIENT_ID &&
      process.env.REACT_APP_APPLE_REDIRECT_URI
    ) {
      window.AppleID.auth.init({
        clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
        scope: 'email',
        redirectURI: process.env.REACT_APP_APPLE_REDIRECT_URI,
      });
    }
    // Note: search query parameters used for Apple Login
    let queryString = props.location.search;
    let urlParams = new URLSearchParams(queryString);
    // Clear Query parameters
    window.history.pushState({}, document.title, window.location.pathname);
    // console.log(props,urlParams)
    // Successful Log in with Apple, set cookies, context, redirect
    if (urlParams.has('id')) {
      let customerId = urlParams.get('id');
      Auth.setIsAuth(true);
      Cookies.set('login-session', 'good');
      console.log("working on encryption--first")
      

      var CryptoJS = require("crypto-js");
      console.log("working on encryption--in")
      var ciphertext = CryptoJS.AES.encrypt(customerId, process.env.REACT_APP_UID_ENCRYPT_CODE).toString();
      Cookies.set('customer_uid', ciphertext);

      

      axios
        .get(process.env.REACT_APP_SERVER_BASE_URI + 'Profile/' + customerId)
        .then((response) => {
          // console.log('Account:', response);
          let newAccountType = response.data.result[0].role.toLowerCase();
          switch (newAccountType) {
            case 'admin':
              Auth.setAuthLevel(2);
              props.history.push('/admin');
              break;
            case 'farmer':
              Auth.setAuthLevel(1);
              props.history.push('/admin');
              break;
            case 'customer':
              Auth.setAuthLevel(0);
              props.history.push('/store');
              break;
            // Farmer roles are moving towards business Id string
            default:
              Auth.setAuthLevel(0);
              props.history.push('/store');
          }
        })
        .catch((err) => {
          console.log(err.response || err);
        });
      props.history.push('/admin');
    }
    // Log which media platform user should have signed in with instead of Apple
    // May eventually implement to display the message for which platform to Login
    // else if (urlParams.has('media')) {
    //   console.log(urlParams.get('media'));
    // }
  }, []);

  useEffect(() => {
    if (
      process.env.REACT_APP_APPLE_CLIENT_ID &&
      process.env.REACT_APP_APPLE_REDIRECT_URI
    ) {
      window.AppleID.auth.init({
        clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
        scope: 'email',
        redirectURI: process.env.REACT_APP_APPLE_REDIRECT_URI,
      });
    }
    let queryString = props.location.search;
    let urlParams = new URLSearchParams(queryString);
    // Clear Query parameters
    window.history.pushState({}, document.title, window.location.pathname);
    // console.log(props, urlParams);
    // Successful Log in with Apple, set cookies, context, redirect
    if (urlParams.has('id')) {
      let customerId = urlParams.get('id');
      Auth.setIsAuth(true);
      Cookies.set('login-session', 'good');
      
      var CryptoJS = require("crypto-js");
      console.log("working on encryption--in")
      var ciphertext = CryptoJS.AES.encrypt(customerId, process.env.REACT_APP_UID_ENCRYPT_CODE).toString();
      Cookies.set('customer_uid', ciphertext);

      
      props.history.push('/admin');
    }
    // Log which media platform user should have signed in with instead of Apple
    // May eventually implement to display the message for which platform to Login
    // else if (urlParams.has('media')) {
    //   console.log(urlParams.get('media'));
    // }
  }, []);

  const handleEmailChange = (e) => {
    // console.log('email is changing')
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    // console.log('password is changing')
    setPassword(e.target.value);
  };

  const verifyLoginInfo = (e) => {
    // Attempt to login
    // Get salt for account
    axios
      .post(API_URL + 'AccountSalt', {
        // params: {
        email: emailValue,
        // }
      })
      .then((res) => {
        // console.log(emailValue, passwordValue);
        let saltObject = res;
        if (saltObject.data.code === 200) {
          let hashAlg = saltObject.data.result[0].password_algorithm;
          let salt = saltObject.data.result[0].password_salt;
          // let salt = "cec35d4fc0c5e83527f462aeff579b0c6f098e45b01c8b82e311f87dc6361d752c30293e27027653adbb251dff5d03242c8bec68a3af1abd4e91c5adb799a01b";
          if (hashAlg != null && salt != null) {
            // Make sure the data exists
            if (hashAlg !== '' && salt !== '') {
              // Rename hash algorithm so client can understand
              switch (hashAlg) {
                case 'SHA512':
                  hashAlg = 'SHA-512';
                  break;
                default:
                  break;
              }
              // console.log(hashAlg);
              // Salt plain text password
              let saltedPassword = passwordValue + salt;
              // console.log(saltedPassword);
              // Encode salted password to prepare for hashing
              const encoder = new TextEncoder();
              const data = encoder.encode(saltedPassword);
              //Hash salted password
              crypto.subtle.digest(hashAlg, data).then((res) => {
                let hash = res;
                // Decode hash with hex digest
                let hashArray = Array.from(new Uint8Array(hash));
                let hashedPassword = hashArray
                  .map((byte) => {
                    return byte.toString(16).padStart(2, '0');
                  })
                  .join('');
                // console.log(hashedPassword);
                let loginObject = {
                  email: emailValue,
                  password: hashedPassword,
                  social_id: '',
                  signup_platform: '',
                };
                // console.log(JSON.stringify(loginObject));
                axios
                  .post(API_URL + 'Login', loginObject, {
                    headers: {
                      'Content-Type': 'text/plain',
                    },
                  })
                  //TODO: Tell Prashant social login has to be done from back end
                  .then((res) => {
                    //TODO: tell to please use Google/ Facebook login
                    // console.log(res);
                    if (res.data.code === 200) {
                      setError('');
                      // console.log('Login success');
                      let customerInfo = res.data.result[0];
                      Auth.setIsAuth(true);
                      Cookies.set('login-session', 'good');
                      
                      var CryptoJS = require("crypto-js");
                      console.log("working on encryption--in-242")
                      var ciphertext = CryptoJS.AES.encrypt(customerInfo.customer_uid, process.env.REACT_APP_UID_ENCRYPT_CODE).toString();
                      Cookies.set('customer_uid', ciphertext);

                      
                      let newAccountType = customerInfo.role.toLowerCase();
                      switch (newAccountType) {
                        case 'admin':
                          Auth.setAuthLevel(2);
                          props.history.push('/admin');
                          break;
                        case 'farmer':
                          Auth.setAuthLevel(1);
                          props.history.push('/admin');
                          break;
                        case 'customer':
                          Auth.setAuthLevel(0);
                          props.history.push('/store');
                          break;
                        // Farmer roles are moving towared business Id string
                        default:
                          Auth.setAuthLevel(1);
                          props.history.push('/admin');
                          break;
                      }
                    } else if (res.data.code === 404) {
                      // console.log('Invalid credentials');
                      setError('credential');
                      setErrorMessage('Invalid credentials');
                      setemailError(true);
                    } else if (res.data.code === 406) {
                      // console.log('Wrong Password');
                      setError('Password');
                      setErrorMessage('Invalid Password');
                      setpasswordError(true);
                    } else if (res.data.code === 401) {
                      // console.log('Need to log in by social media');
                      setError('social');
                      setErrorMessage(res.data.message);
                    } else if (res.data.code === 407) {
                      // console.log('Need email verification');
                      setError('email_verify');
                      axios
                        .post(
                          process.env.REACT_APP_SERVER_BASE_URI +
                            'email_verification',
                          { email: emailValue },
                          {
                            headers: {
                              'Content-Type': 'text/plain',
                            },
                          }
                        )
                        .then((res) => {
                          console.log(res);
                          setErrorMessage(
                            'Email not verified. Check your email to get link for verification.'
                          );
                        })
                        .catch((err) => {
                          setErrorMessage('Email not verified.');
                          if (err.response) {
                            console.log(err.response);
                          }
                          console.log(err);
                        });
                    } else {
                      // console.log('Unknown login error');
                      setError('unknown');
                      setErrorMessage(res.data.message);
                    }
                  })
                  .catch((err) => {
                    // Log error for Login endpoint
                    if (err.response) {
                      console.log(err.response);
                    }
                    console.log(err);
                  });
              });
            }
          } else {
            // No hash/salt information, probably need to sign in by socail media
            console.log('Salt not found');
            // Try to login anyway to confirm
            let loginObject = {
              email: emailValue,
              password: 'test',
              token: '',
              signup_platform: '',
            };
            // console.log(JSON.stringify(loginObject))
            axios
              .post(API_URL + 'Login', loginObject, {
                headers: {
                  'Content-Type': 'text/plain',
                },
              })
              .then((res) => {
                console.log(res);
                if (res.data.code === 404) {
                  console.log('Invalid credentials');
                  setError('credential');
                  setErrorMessage('Invalid credentials');
                  setemailError(true);
                } else {
                  console.log('Unknown login error');
                  setError('unknown');
                  setErrorMessage('Login failed, try again');
                }
              })
              .catch((err) => {
                // Log error for Login endpoint
                if (err.response) {
                  console.log(err.response);
                }
                console.log(err);
              });
          }
        } else if (res.data.code === 401) {
          console.log('Use Social Login');
          setError('social');
          let socialMediaUsed = res.data.result[0].user_social_media;
          let socialMediaUsedFormat =
            socialMediaUsed.charAt(0) + socialMediaUsed.slice(1).toLowerCase();
          let newErrorMessage = 'Use ' + socialMediaUsedFormat + ' to login';
          setSocialMedia(socialMediaUsedFormat);
          setsocialError(true);
          setErrorMessage(newErrorMessage);
        } else if (res.data.code === 404) {
          // No information, probably because invalid email
          console.log('Invalid credentials');
          setError('credential');
          setErrorMessage('Invalid credentials');
          setemailError(true);
        } else {
          console.log('Unknown log in error');
          setError('Log in failed, try again');
        }
      })
      .catch((err) => {
        // Log error for account salt endpoint
        if (err.response) {
          console.log(err.response);
        }
        console.log(err);
      });
  };
  console.log('Social Media', socialMedia);
  const showError = () => {
    if (errorValue === '') {
      return null;
    }
    return <Typography style={{ color: 'red' }}>{errorMessage}</Typography>;
  };

  return (
    <div
      style={{
        // position: 'absolute',
        // right: '0',
        // right: '350px',
        // width: '100vw',
        width: '100%',
        // width: '600px',
        zIndex: 10040,
        // border: '1px dashed'
      }}
    >
      <Paper style={paperStyle}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box
              my={1}
              style={{
                color: appColors.secondary,
                fontSize: '32px',
                fontWeight: 'bolder',
                textDecoration: 'underline',
                marginBottom: '25px',
              }}
            >
              Log In
            </Box>
          </Grid>

          <SocialLogin setError={setError} setErrorMessage={setErrorMessage} />
          <form style={{ marginRight: 'auto', marginLeft: 'auto' }}>
            <Box
              style={{
                borderBottom: '2px solid #136D74',
                marginBottom: '20px',
                marginTop: '20px',
              }}
            ></Box>

            <p
              style={{
                fontWeight: 'bold',
                marginRight: 'auto',
                marginLeft: 'auto',
                marginBottom: '0px',
                marginTop: '20px',
              }}
            >
              Or continue with email
            </p>
            <Grid item xs={12} style={{ marginTop: '20px' }}>
              <CssTextField
                error={errorValue}
                id="outlined-required"
                label="Email"
                variant="outlined"
                size="small"
                value={emailValue}
                onChange={handleEmailChange}
                style={{
                  width: '300px',
                  marginBottom: '10px',
                  borderRadius: '10px',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CssTextField
                error={errorValue}
                id="outlined-password-input"
                label="Password"
                type={passVisible.showPassword ? 'password' : 'text'}
                variant="outlined"
                size="small"
                value={passwordValue}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {passVisible.showPassword ? (
                        <VisibilityIcon
                          onClick={handleClickShowPassword}
                          style={{ color: 'rgb(74,124,133)' }}
                          aria-hidden="false"
                        />
                      ) : (
                        <VisibilityOff
                          onClick={handleClickShowPassword}
                          style={{ color: 'rgb(74,124,133)' }}
                          aria-hidden="false"
                        ></VisibilityOff>
                      )}
                    </InputAdornment>
                  ),
                }}
                onChange={handlePasswordChange}
                style={{
                  width: '300px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {showError()}
            </Grid>
            <Grid item xs={12}>
              <Box mb={2}>
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: appColors.primary,
                    color: 'white',
                    width: '300px',
                    height: '40px',
                  }}
                  onClick={verifyLoginInfo}
                >
                  Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <p
                style={{
                  color: appColors.secondary,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                onClick={onReset}
              >
                Reset Password
              </p>
            </Grid>
          </form>
        </Grid>
      </Paper>
      {emailError && (
        <EmailModal
          clear={setemailError}
          setIsSignUpShown={props.setIsSignUpShown}
          setIsLoginShown={props.setIsLoginShown}
        />
      )}
      {passModal && <PassModal clear={setpassModal}></PassModal>}
      {passwordError && (
        <IncorrectPasswordModal
          emailValue={emailValue}
          clear={setpasswordError}
          setIsSignUpShown={props.setIsSignUpShown}
          setIsLoginShown={props.setIsLoginShown}
        />
      )}
      {socialError && (
        <SocialLoginErrorModal
          socialMedia={socialMedia}
          clear={setsocialError}
          setIsSignUpShown={props.setIsSignUpShown}
          setIsLoginShown={props.setIsLoginShown}
        />
      )}
    </div>
  );
}

const paperStyle = {
  width: '350px',
  textAlign: 'center',
  display: 'inline-block',
  padding: '20px',
  // marginTop: '50px',
  backgroundColor: '#E0E6E6F2',
};

export default withRouter(AdminLogin);
