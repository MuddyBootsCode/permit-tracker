import React from 'react';
import Map from './Map';
import { makeStyles } from '@material-ui/core/styles';
import { Divider, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  hr: {
    width: '80%',
    color: 'black',
  },
}));

const MapControls = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.controls}>
        <Typography variant='h6'>Map Controls</Typography>
        <hr className={classes.hr} />
      </div>
      <div id='map-controls' style={{ position: 'relative' }}>
        <Map />
      </div>
    </div>
  );
};

export default MapControls;
