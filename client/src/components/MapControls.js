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

const COUNTY_QUERY = gql`
  query County($name: String) {
    County(name: $name) {
      name
      geometry
    }
  }
`;

const MapControls = () => {
  const classes = useStyles();
  const [county, setCounty] = useState('Martin');
  const { data, error, loading } = useQuery(COUNTY_QUERY, {
    variables: { name: county },
  });
  const [countyGeo, setCountyGeo] = useState({});

  useEffect(() => {
    if (data) {
      setCountyGeo(JSON.parse(data.County[0].geometry));
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
