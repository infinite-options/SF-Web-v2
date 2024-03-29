import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AdminLogin from '../LogIn/AdminLogin';
import LandingNavBar from '../LandingNavBar/LandingNavBar';
import Footer from '../Footer/Footer';
import './Sweepstakes.css';
import Box from '@material-ui/core/Box';
import { Container } from '@material-ui/core';
import { Grid, Paper, Typography, Avatar, Button } from '@material-ui/core';
import Apple from '../../images/Mask Group 1.png';
import Google from '../../images/en_badge_web_generic.png';
import { useHistory } from 'react-router-dom';
import appColors from '../../styles/AppColors';
import { makeStyles } from '@material-ui/core/styles';
import Signup from '../SignUp/newSignUp';
import ConfirmatioModal from 'components/SignUp/ConfirmationModal';

const useStyles = makeStyles((theme) => ({
  authModal: {
    position: 'absolute',
    // width: '500px',
    top: '50px',
    zIndex: '10040',
    height: 'auto',
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
  infoTitle: {
    color: appColors.primary,
    // marginBottom: '10px',
    fontWeight: 'bold',
    fontSize: '32px',
    marginBottom: '5px',
  },
  infoDesc: {
    paddingLeft: '20%',
    paddingRight: '20%',
    textAlign: 'center',
    color: '#000000',
  },
  title: {
    color: appColors.secondary,
    fontSize: '40px',
    fontWeight: '700',
  },
  bar: {
    borderBottom: '4px solid ' + appColors.secondary,
    marginBottom: '50px',
    width: '410px',
  },
  root: {
    backgroundColor: appColors.buttonText,
    width: '100%',
    height: 'auto',
    //paddingTop: '5px',
    paddingBottom: '30px',
  },

  farmTitle: {
    color: appColors.primary,
    marginBottom: '10px',
    fontSize: '30px',
    fontWeight: '700',
    textAlign: 'left',
  },
  farmDesc: {
    color: 'black',
    textAlign: 'left',
    fontSize: '20px',
    fontWeight: '500',
  },

  testimonial: {
    //backgroundColor: appColors.componentBg,
    width: '100%',

    paddingTop: '30px',
    paddingBottom: '30px',
  },

  farmer: {
    backgroundColor: 'white',
    width: '100%',
    height: 'auto',
    paddingTop: '30px',
    paddingBottom: '30px',
  },
}));

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

function beforeClick1() {
  console.log('Hello WOrld!');
  return <div>Hello World</div>;
}

const Sweepstakes = () => {
  const history = useHistory();
  const classes = useStyles();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoginShown, setIsLoginShown] = useState(false); // checks if user is logged in
  const [isSignUpShown, setIsSignUpShown] = useState(false);
  const [confirmEmailstate, setConfirmEmail] = useState(false);

  const loginWrapperRef = useRef(null);
  useOutsideAlerter(loginWrapperRef, setIsLoginShown);
  const signupWrapperRef = useRef(null);
  useOutsideAlerter(signupWrapperRef, setIsSignUpShown);

  const [showSubmission, setShowSubmission] = useState(false);
  const [entryShow, setEntryShow] = useState(false);
  const [referralShow, setReferralShow] = useState(false);
  //posting to update_Coupons/crate
  const url =
    'https://tsx3rnuidi.execute-api.us-west-1.amazonaws.com/dev/api/v2/sweepstakes/post';
  const [sweepstakeEntry, setSweepstakeEntry] = useState({
    sweep_name: '',
    sweep_address: '',
    sweep_zipcode: '',
    sweep_phone_number: '',
    sweep_referrer: '',
    sweep_referrer_email: '',
  });

  function submit(e) {
    e.preventDefault();
    axios
      .post(url, {
        sweep_name: sweepstakeEntry.sweep_name,
        sweep_address: sweepstakeEntry.sweep_address,
        sweep_zipcode: sweepstakeEntry.sweep_zipcode,
        sweep_phone_number: sweepstakeEntry.sweep_phone_number,
        sweep_referrer: sweepstakeEntry.sweep_referrer,
        sweep_referrer_email: sweepstakeEntry.sweep_referrer_email,
      })
      .then((response) => {
        console.log(response.data);
        setShowSubmission(!showSubmission);
        setName(sweepstakeEntry.sweep_name);
        setEmail(sweepstakeEntry.sweep_address);
        setZipcode(sweepstakeEntry.sweep_zipcode);
        setPhone(sweepstakeEntry.sweep_phone_number);
        sweepstakeEntry.sweep_name = '';
        sweepstakeEntry.sweep_address = '';
        sweepstakeEntry.sweep_zipcode = '';
        sweepstakeEntry.sweep_phone_number = '';
        sweepstakeEntry.sweep_referrer = '';
        sweepstakeEntry.sweep_referrer_email = '';
      });
  }
  console.log(name);
  console.log(email);
  function handle(e) {
    const newSweepstakeEntry = { ...sweepstakeEntry };
    newSweepstakeEntry[e.target.id] = e.target.value;
    setSweepstakeEntry(newSweepstakeEntry);
  }
  const [referralEntry, setReferralEntry] = useState({
    sweep_name: '',
    sweep_address: '',
    sweep_zipcode: '',
    sweep_phone_number: '',
    sweep_referrer: name,
    sweep_referrer_email: email,
  });

  function submitReferral(e, name, email) {
    e.preventDefault();
    axios
      .post(url, {
        sweep_name: referralEntry.sweep_name,
        sweep_address: referralEntry.sweep_address,
        sweep_zipcode: referralEntry.sweep_zipcode,
        sweep_phone_number: referralEntry.sweep_phone_number,
        sweep_referrer: name,
        sweep_referrer_email: email,
      })
      .then((response) => {
        console.log(response.data);
        setEntryShow(!entryShow);
        setReferralShow(!referralShow);
        referralEntry.sweep_name = '';
        referralEntry.sweep_address = '';
        referralEntry.sweep_zipcode = '';
        referralEntry.sweep_phone_number = '';
        referralEntry.sweep_referrer = '';
        referralEntry.sweep_referrer_email = '';
      });
  }
  function handleReferral(e) {
    const newReferralEntry = { ...referralEntry };
    newReferralEntry[e.target.id] = e.target.value;
    setReferralEntry(newReferralEntry);
  }
  return (
    <div
      id="beforeClick"
      style={{
        paddingLeft: 0,
        paddingRight: 0,
        backgroundSize: 'cover',
        backgroundImage: `url(${'fruits-and-vegetables-blur.png'})`,
        backgroundRepeat: 'no-repeat',
        width: '100%',
      }}
    >
      <div className="contentWrap">
        {/* <LandingNavBar /> */}
        <LandingNavBar
          isLoginShown={isLoginShown}
          setIsLoginShown={setIsLoginShown}
          isSignUpShown={isSignUpShown}
          setIsSignUpShown={setIsSignUpShown}
        />

        {/* START: Login/SignUp Modal */}
      <Box 
        display="flex" justifyContent="flex-end"
        style={{
          // border: 'solid red'
        }}
      >
        {/* Login Modal */}
        <Box
          position="absolute"
          // width="50%"
          width="100%"
          display="flex"
          justifyContent="center"
          zIndex={40}
          style={{
            // border: 'solid blue'
          }}
        >
          <Box
            ref={loginWrapperRef}
            className={classes.authModal}
            hidden={!isLoginShown}
            // width="100%"
            style={{
              // border: 'solid green',
              // width: '100%'
              // padding: '0',
              // margin: '0'
            }}
          >
            <AdminLogin
              // ref={loginWrapperRef}
              // hidden={!isLoginShown}
              isLoginShown={isLoginShown}
              setIsLoginShown={setIsLoginShown}
              isSignUpShown={isSignUpShown}
              setIsSignUpShown={setIsSignUpShown}
            />
          </Box>
        </Box>

        {/* Sign Up Modal */}
        <Box 
          display="flex" justifyContent="flex-end"
          width="100%"
          style={{
            // border: 'solid red'
          }}
          position="absolute"
        >
          <Box
            // position="absolute"
            // width="50%"
            display="flex"
            width="100%"
            justifyContent="center"
            zIndex={4000}
            style={{
              // border: 'solid blue'
            }}
          >
            <Box
              ref={signupWrapperRef}
              className={classes.authModal}
              hidden={!isSignUpShown}
              // width="100%"
              style={{
                // border: 'solid green',
                // width: '100%'
              }}
            >
              <Signup
                isLoginShown={isLoginShown}
                setIsLoginShown={setIsLoginShown}
                isSignUpShown={isSignUpShown}
                setIsSignUpShown={setIsSignUpShown}
                isconfirmEmailstate={confirmEmailstate}
                setConfirmEmail={setConfirmEmail}
              />
            </Box>
          </Box>
        </Box>
        {confirmEmailstate && (
          <ConfirmatioModal
            isLoginShown={isLoginShown}
            setIsLoginShown={setIsLoginShown}
            isSignUpShown={isSignUpShown}
            setIsSignUpShown={setIsSignUpShown}
            isconfirmEmailstate={confirmEmailstate}
            setConfirmEmail={setConfirmEmail}
          />
        )}
      </Box>

        <Box hidden={showSubmission}>
          <div>
            <p className="FreeFF">Free Fresh Food!</p>
            <p className="Enter">
              Enter now to win $50 worth of fresh produce,{' '}
              <div>delivered free of charge to your door.</div>
            </p>
          </div>
          <Container className="container">
            <button className="Card1">
              <div className="text">
                Customizable box of fresh produce worth
                <div className="value1">$20</div>
              </div>
            </button>
            <button className="Card2">
              <div className="text">
                Customizable box of fresh produce <div>worth</div>
                <div className="value">$50</div>
              </div>
            </button>
            <button className="Card3">
              <div className="text">
                Customizable box of fresh produce worth
                <div className="value1">$30</div>
              </div>
            </button>
          </Container>
          <div>
            <p className="FreeFF">Submit entry to win!</p>
            <form onSubmit={(e) => submit(e)}>
              <input
                className="input"
                id="sweep_name"
                type="text"
                placeholder="Enter Name"
                onChange={(e) => handle(e)}
                value={sweepstakeEntry.sweep_name}
                required
              />
              <br />
              <input
                className="input"
                id="sweep_address"
                type="text"
                placeholder="Email Address"
                onChange={(e) => handle(e)}
                value={sweepstakeEntry.sweep_address}
                required
              />
              <br />
              <input
                className="input"
                id="sweep_zipcode"
                type="text"
                placeholder="Zip Code"
                onChange={(e) => handle(e)}
                value={sweepstakeEntry.sweep_zipcode}
                required
              />
              <br />
              <input
                className="input"
                id="sweep_phone_number"
                type="text"
                placeholder="Phone"
                onChange={(e) => handle(e)}
                value={sweepstakeEntry.sweep_phone_number}
              />
              <p className="Enter">If you were referred</p>

              <input
                className="input"
                id="sweep_referrer"
                type="text"
                placeholder="Your friend’s name "
                onChange={(e) => handle(e)}
                value={sweepstakeEntry.sweep_referrer}
              />
              <br />
              <input
                className="input"
                id="sweep_referrer_email"
                type="text"
                placeholder="Your friend’s email ID"
                onChange={(e) => handle(e)}
                value={sweepstakeEntry.sweep_referrer_email}
              />
              <br />
              <button className="button">Submit Entry</button>
            </form>
          </div>
        </Box>

        <Box hidden={!showSubmission}>
          <div>
            <p className="FreeFF">Submission Successful!</p>
            <p className="SW2Text">Winners announced August 31, 2021</p>
          </div>
          <p 
            className="SW2Text"
            style={{
              margin: '0 30px 30px 30px'
            }}
          >
            {/* You can also refer a friend and be eligible for an
            <div>additional $10 prize.</div> */}
            You can also refer a friend and be eligible for an
            additional $10 prize.
          </p>
          <Box hidden={!entryShow}>
            {' '}
            <form onSubmit={(e) => submitReferral(e, name, email)}>
              <input
                className="input"
                id="sweep_name"
                type="text"
                placeholder="Name of your friend"
                onChange={(e) => handleReferral(e)}
                value={referralEntry.sweep_name}
              />
              <br />
              <input
                className="input"
                id="sweep_address"
                type="text"
                placeholder="Email id of your friend"
                onChange={(e) => handleReferral(e)}
                value={referralEntry.sweep_address}
              />
              <br />
              <button className="button">Submit Entry</button>
            </form>
          </Box>
          <Box hidden={!referralShow}>
            {' '}
            <p className="FreeFF">Thank you for your referral!</p>
          </Box>
          <button
            className="referButton"
            type="button"
            onClick={() => setEntryShow(!entryShow)}
            style={{
              width: '280px'
            }}
          >
            Refer a friend+
          </button>
          {/* <div
            style={{
              border: '1px solid red',
              maxWidth: '100%',
              display: 'inline-block',

            }}
          >
            <div className="FreeFF">Until then...</div>
            <div 
              className="SW2Text"
              style={{
                border: '1px solid blue',
                maxWidth: '96%'
              }}
            >
              New customers are eligible for free delivery and
              existing customers always get free deliveries on all
              orders above $30
            </div>
          </div> */}
          <div>
            <p className="FreeFF">Until then...</p>
            <p 
              className="SW2Text"
              style={{
                margin: '0 30px 50px 30px'
              }}
            >
              New customers are eligible for free delivery and
              existing customers always get free deliveries on all
              orders above $30
            </p>
          </div>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              className="Box2"
              style={{
                backgroundImage: `url(${'sweestakebg.svg'})`,
                // border: 'dashed'
              }}
            >
              <div 
                className="row"
                // style={{
                //   border: 'dashed'
                // }}
              >
                <div 
                  className="column"
                  // style={{
                  //   border: '1px solid lime'
                  // }}
                >
                  <p className="downloadText">Download the app</p>
                  <a
                    href="https://apps.apple.com/us/app/serving-fresh/id1488267727"
                    target="_blank"
                  >
                    <img 
                      className="img" src={Apple} 
                      style={{
                        width: '177px'
                      }}
                    />
                  </a>

                  <div>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.servingfresh"
                      target="_blank"
                    >
                      <img className="img" src={Google} 
                        style={{
                          width: '200px'
                        }}
                      />
                    </a>
                  </div>
                </div>
                <div 
                  className="column"
                >
                  {/* <p 
                    className="OrVisitText" 
                    style={{ 
                      padding: '1rem',
                      // border: '1px solid red'
                    }}
                  >
                    Or visit us on
                    <br />
                    <a
                      href="https://servingfresh.me/"
                      style={{
                        textDecoration: 'none',
                        color: '#2b6d74',
                        // border: '1px solid red',
                        // padding: '1rem'
                      }}
                    >
                      ServingFresh.me
                    </a>
                  </p> */}
                  {/* <div
                    className="OrVisitText" 
                    // style={{
                    //   border: 'dashed'
                    // }}
                  >
                    <div
                      // className="OrVisitText" 
                      style={{ 
                        padding: '1rem',
                        border: '1px solid red'
                      }}
                    >
                      Or visit us on
                    </div>
                    <div
                      style={{ 
                        padding: '1rem',
                        border: '1px solid cyan',
                        color: '#2b6d74',
                      }}
                    >
                      <a
                        href="https://servingfresh.me/"
                        style={{
                          textDecoration: 'none',
                          color: '#2b6d74',
                          // border: '1px solid cyan',
                          // padding: '1rem'
                        }}
                      >
                      ServingFresh.me
                      </a>
                    </div>
                  </div> */}
                  <p 
                    className="OrVisitText" 
                    style={{ 
                      // padding: '50px 1rem 1rem 1rem',
                      // border: '1px solid red'
                    }}
                  >
                    Or visit us on
                    <br />
                    <a
                      href="https://servingfresh.me/"
                      style={{
                        textDecoration: 'none',
                        color: '#2b6d74',
                        // border: '1px solid red',
                        // padding: '1rem'
                      }}
                    >
                      ServingFresh.me
                    </a>
                  </p>
                </div>
              </div>
            </Box>
          </Box>
        </Box>
        <div className="footer">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Sweepstakes;
