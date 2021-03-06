import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
} from '@material-ui/core';
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import BusinessAnalytics from './Analytics/BusinessAnalytics';
import ItemAnalytics from './Analytics/ItemAnalytics';
import DateAnalytics from './Analytics/DateAnalytics';
import CustomerRevenue from './Revenue/CustomerRevenue';
import BusinessRevenue from './Revenue/BusinessRevenue';
import ItemRevenue from './Revenue/ItemRevenue';
import { AuthContext } from '../../auth/AuthContext';
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    backgroundColor: '#BCCDCE',
    padding: '1rem',
    justifyContent: 'space-between',
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: '20px',

    '@media (min-width: 380px)': {
      width: '160px',
    },
    '@media (min-width: 680px)': {
      width: '200px',
    },
    '@media (min-width: 980px)': {
      width: '260px',
    },

    '@media (min-width: 1380px)': {
      width: '280px',
    },
    '@media (min-width: 1580px)': {
      width: '360px',
    },
    '@media (min-width: 1680px)': {
      width: '400px',
    },
    '@media (min-width: 1920px)': {
      width: '460px',
    },
  },
  paper1: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: '20px',
    '@media (min-width: 380px)': {
      width: '160px',
    },
    '@media (min-width: 680px)': {
      width: '200px',
    },
    '@media (min-width: 980px)': {
      width: '260px',
    },
    '@media (min-width: 1380px)': {
      width: '260px',
    },
    '@media (min-width: 1580px)': {
      width: '300px',
    },
    '@media (min-width: 1680px)': {
      width: '320px',
    },
    '@media (min-width: 1920px)': {
      width: '360px',
    },
  },
  chart: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: '20px',
    width: '800px',
    marginBottom: '1rem',

    '@media (min-width: 980px)': {
      width: '800px',
    },
    '@media (min-width: 1380px)': {
      width: '860px',
    },
    '@media (min-width: 1580px)': {
      width: '900px',
    },
    '@media (min-width: 1680px)': {
      width: '1000px',
    },
    '@media (min-width: 1920px)': {
      width: '1160px',
    },
  },
  header: {
    textAlign: 'center',
    font: 'normal normal bold 16px/19px SF Pro Display',
    letterSpacing: '0.25px',
    color: '#1C6D74',
    opacity: 1,
    padding: '0.5rem',
  },
  upcoming: {
    display: 'flex',
    textAlign: 'left',
    font: 'normal normal medium SF Pro Display',
    fontSize: '14px',
    letterSpacing: ' 0.22px',
    color: '#1C6D74',
    opacity: 1,
  },
  currUserPic: {
    margin: '5px',
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  subheader: {
    textAlign: 'left',
    font: 'normal normal bold 60px SF Pro Display',
    letterSpacing: '1.91px',
    color: '#1C6D74',
    opacity: 1,
  },
}));

function updateSweepstakes(nextSweepStatus) {
  const endpoint = `https://3o9ul2w8a1.execute-api.us-west-1.amazonaws.com/dev/api/v2/promotions`;
  fetch(
    `${endpoint}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'SF',
        status: nextSweepStatus,
      }),
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

function fetchSweepstakes(setSweepstakeActive) {
  const endpoint = `https://3o9ul2w8a1.execute-api.us-west-1.amazonaws.com/dev/api/v2/promotions`;
  fetch(
    `${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name: 'SF'}),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((json) => {
      const sweeps = json;
      setSweepstakeActive(sweeps === 'ACTIVE');
    })
    .catch((error) => {
      console.error(error);
    });
}

function AdminDashboard() {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  //upcoming orders
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [newOrders, setNewOrders] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    axios
      .get(
        'https://tsx3rnuidi.execute-api.us-west-1.amazonaws.com/dev/api/v2/admin_report_groupby/all'
      )
      .then((res) => {
        let temp_qty = 0;
        let temp_rev = 0;

        console.log(res.data.result);
        for (const vals of res.data.result) {
          if (vals['delivery_status'] === 'FALSE') {
            temp_qty = temp_qty + 1;
            temp_rev =
              temp_rev + Number(vals['amount_paid'] ? vals['amount_paid'] : 0);
          }
        }
        console.log(temp_qty);
        console.log(temp_rev);
        setTotalQuantity(Number(temp_qty));
        setTotalRevenue(Number(temp_rev).toFixed(2));
        setUpcomingOrders(
          res.data.result.sort(function (a, b) {
            var textA = a.delivery_first_name.toUpperCase();
            var textB = b.delivery_first_name.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
          })
        );
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
        console.log(err);
      });
    
    fetchSweepstakes(auth.setSweepstakeActive);
  }, []);
  useEffect(() => {
    axios
      .get(
        'https://tsx3rnuidi.execute-api.us-west-1.amazonaws.com/dev/api/v2/new_customer_info'
      )
      .then((res) => {
        let temp_qty = 0;

        console.log(res.data.result);
        for (const vals of res.data.result) {
          temp_qty = temp_qty + 1;
        }
        console.log('New Customers', temp_qty);
        setNewCustomers(Number(temp_qty));
        setNewOrders(
          res.data.result.sort(function (a, b) {
            var textA = a.delivery_first_name.toUpperCase();
            var textB = b.delivery_first_name.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
          })
        );
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
        console.log(err);
      });
  }, []);
  const sweepstakeToggle = () => {
    console.log('Sweepstake in Toggle function:', auth.sweepstakeActive);
    const nextSweepsActive = !auth.sweepstakeActive;
    auth.setSweepstakeActive(nextSweepsActive);
    console.log('Sweepstake after toggle:', nextSweepsActive);
    setOpen(true);
    updateSweepstakes(nextSweepsActive ? 'ACTIVE' : 'INACTIVE');
  };

  return (
    <div className={classes.root}>
      <div style={{ paddingRight: '1rem' }}>
        <Grid
          container
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item>
            <Button
              onClick={sweepstakeToggle}
              style={{
                backgroundColor: '#F5841F',
                color: 'white',
                height: '2rem',
                marginBottom: '0.75rem',
                textTransform: 'none',
              }}
            >
              {auth.sweepstakeActive ? (
                <div>Turn Sweepstake Off</div>
              ) : (
                <div>Turn Sweepstake On</div>
              )}
            </Button>
            <Paper className={classes.paper}>
              <Typography className={classes.header}>
                Upcoming Orders
              </Typography>
              <div>
                {upcomingOrders.map((info) => {
                  return info.delivery_status === 'FALSE' ? (
                    <div
                      style={{
                        display: 'flex',
                        borderBottom: '0.5px solid #F5841F',
                        padding: '4px',
                      }}
                    >
                      <Box
                        display="inline"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography className={classes.upcoming}>
                          {moment(info.start_delivery_date)
                            .format('dddd')
                            .substring(0, 3)}
                          ,<br />
                          {moment(info.start_delivery_date)
                            .format(' MMMM Do')
                            .slice(0, -2)}
                        </Typography>
                      </Box>

                      <Avatar
                        variant="rounded"
                        src={'no-link'}
                        className={classes.currUserPic}
                      >
                        <Typography style={{ fontSize: '25px' }}>
                          {info.delivery_first_name || info.delivery_last_name
                            ? `${info.delivery_first_name[0]}${info.delivery_last_name[0]}`
                            : 'JD'}
                        </Typography>
                      </Avatar>
                      <Box>
                        <Box alignItems="center" justifyContent="center">
                          <Typography className={classes.upcoming}>
                            {info.delivery_first_name}&nbsp;
                            {info.delivery_last_name}
                          </Typography>
                        </Box>
                        <Box alignItems="center" justifyContent="center">
                          <Typography className={classes.upcoming}>
                            {info.delivery_address}
                          </Typography>
                        </Box>
                      </Box>
                    </div>
                  ) : null;
                })}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
      <div style={{width:'100%'}}>
        <Grid container spacing={3}>
          <Grid item>
            <Paper className={classes.paper1}>
              <Typography className={classes.header}>
                First time customers
              </Typography>
              <Typography className={classes.subheader}>
                #{newCustomers}
              </Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={classes.paper1}>
              <Typography className={classes.header}>
                Number of Upcoming Orders
              </Typography>
              <Typography className={classes.subheader}>
                #{totalQuantity}
              </Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={classes.paper1}>
              <Typography className={classes.header}>
                Upcoming Revenue
              </Typography>
              <Typography className={classes.subheader}>
                ${totalRevenue}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Typography className={classes.header}>Revenue($ vs time)</Typography>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.chart}>
              <CustomerRevenue />
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.chart}>
              <BusinessRevenue />
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.chart}>
              <ItemRevenue />
            </Paper>
          </Grid>
        </Grid>
        <Typography className={classes.header}>
          Analytics(# or $ by customer)
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.chart}>
              <ItemAnalytics />
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.chart}>
              <BusinessAnalytics />
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.chart}>
              <DateAnalytics />
            </Paper>
          </Grid>
        </Grid>
      </div>
      <div>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{'Sweepstake Toggle'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sweepstake set to:
              {auth.sweepstakeActive ? <div>Active</div> : <div>Inactive</div>}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="primary" autoFocus>
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default AdminDashboard;
