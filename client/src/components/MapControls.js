import React, { useEffect, useState } from 'react';
import Map from './Map';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  map: {
    padding: 0,
    margin: 0,
    display: 'block',
    position: 'relative',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: 10,
  },
  hr: {
    width: '80%',
    color: 'black',
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

const MapStyles = [
  { name: 'Streets', url: 'mapbox://styles/mapbox/streets-v11' },
  { name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v11' },
  { name: 'Light', url: 'mapbox://styles/mapbox/light-v10' },
  { name: 'Dark', url: 'mapbox://styles/mapbox/dark-v10' },
  { name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  {
    name: 'Satellite with Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v11',
  },
];

const COUNTY_QUERY = gql`
  query County($name: String) {
    County(name: $name) {
      name
      geometry
    }
  }
`;

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const MapControls = () => {
  const classes = useStyles();
  const [mapControlsState, setMapControlsState] = useState({ countyName: '' });
  const [getCounty, { data, loading, error }] = useLazyQuery(COUNTY_QUERY);
  const [countyGeo, setCountyGeo] = useState(null);

  const handleChange = (e) => {
    e.preventDefault();
    const name = e.target.name;
    const value = e.target.value;
    setMapControlsState({ ...mapControlsState, [name]: value });
  };

  useEffect(() => {
    if (data) {
      IsJsonString(data.County[0].geometry)
        ? setCountyGeo(JSON.parse(data.County[0].geometry))
        : setCountyGeo('');
    }
  }, [data]);

  if (loading) return <div>...Loading</div>;

  if (error) return <div>Something went wrong</div>;

  console.log(mapControlsState);

  return (
    <Grid container spacing={0} className={classes.root} id='map-controls'>
      <Grid
        item
        xs={12}
        id='map-controls-grid-container'
        justifyContent='center'
        className={classes.controls}
      >
        <Typography variant='h6'>Map Controls</Typography>
        <hr className={classes.hr} />
        <TextField
          required
          id='county-field'
          label='Required'
          defaultValue='County'
          name='countyName'
          onChange={handleChange}
        />
        <Button
          variant='contained'
          color='primary'
          className={classes.button}
          onClick={() =>
            getCounty({ variables: { name: mapControlsState.countyName } })
          }
          disabled={mapControlsState.countyName.length === 0}
        >
          Select County
        </Button>
      </Grid>
      <Grid item xs={12} id='map-grid-container' className={classes.map}>
        <Map county={countyGeo} />
      </Grid>
    </Grid>
  );
};

export default MapControls;
