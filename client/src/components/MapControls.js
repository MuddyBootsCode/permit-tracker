import React, { useEffect, useState } from 'react';
import Map from './Map';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { gql, useQuery } from '@apollo/client';

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
  const [county, setCounty] = useState('Midland');
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
    <div className={classes.root}>
      <div className={classes.controls}>
        <Typography variant='h6'>Map Controls</Typography>
        <hr className={classes.hr} />
      </div>
      <div id='map-controls' style={{ position: 'relative' }}>
        <Map county={countyGeo} />
      </div>
    </div>
  );
};

export default MapControls;
