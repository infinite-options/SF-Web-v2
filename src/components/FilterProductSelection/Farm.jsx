import React, { useContext, useState } from 'react';
import ProdSelectContext from '../ProductSelectionPage/ProdSelectContext';
import FarmCard from './cards/FarmCard';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    textAlign: 'center',
    fontSize: 10,
  },
}));

const FarmCategory = () => {
  const classes = useStyles();
  const topNode = useContext(ProdSelectContext);

  function createFarmCard(props) {
    return (
      <FarmCard
        image={props.image}
        businessName={props.name}
        key={props.id}
        id={props.id}
      />
    );
  }

  // const allValidDay = daysInWeek;
  var farms = topNode.farms;
  return <React.Fragment>{farms.map(createFarmCard)}</React.Fragment>;
};

export default FarmCategory;
