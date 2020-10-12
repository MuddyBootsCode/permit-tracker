import './App.css';
import React from 'react';
import Nav from './components/Nav';
import MapControls from './components/MapControls';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Map from './components/Map';
import { Container } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  App: {
    marginBottom: 1,
  },
}));

function App() {
  const classes = useStyles();

  return (
    <div className={classes.App}>
      <Grid container spacing={1} direction='column'>
        <Grid item xs={12} id='nav'>
          <Nav />
        </Grid>
        <Grid item xs={12}>
          <MapControls />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
