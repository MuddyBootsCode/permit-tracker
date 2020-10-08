import './App.css';
import React from 'react';
import Nav from './components/Nav';
import MapControls from './components/MapControls';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  App: {
    display: 'grid',
    gridTemplateRows: '10% 90%',
    marginBottom: 1,
  },
}));

function App() {
  const classes = useStyles();

  return (
    <div className={classes.App}>
      <div id='nav'>
        <Nav />
      </div>
      <div>
        <MapControls />
      </div>
    </div>
  );
}

export default App;
