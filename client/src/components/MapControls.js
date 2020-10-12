import React, { useEffect, useState } from 'react';
import Map from './Map';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { gql, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';

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
  const [county, setCounty] = useState('Reeves');
  const { data, error, loading } = useQuery(COUNTY_QUERY, {
    variables: { name: county },
  });
  const [countyGeo, setCountyGeo] = useState({});

  useEffect(() => {
    if (data) {
      IsJsonString(data.County[0].geometry)
        ? setCountyGeo(JSON.parse(data.County[0].geometry))
        : setCountyGeo('');
    }
  }, [data]);

  if (loading) return <div>...Loading</div>;

  if (error) return <div>Something went wrong</div>;

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
      </Grid>
      <Grid item xs={12} id='map-grid-container' className={classes.map}>
        <Map county={countyGeo} />
      </Grid>
    </Grid>
  );
};

export default MapControls;
