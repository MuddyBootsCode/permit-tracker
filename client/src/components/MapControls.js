import React, { useEffect, useState } from 'react';
import Map from './Map';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Typography } from '@material-ui/core';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import { cityOfMidland } from '../data/cityOfMidland';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import TextField from '@material-ui/core/TextField';

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

const ALL_COUNTY_QUERY = gql`
  query {
    County(orderBy: name_asc) {
      name
    }
  }
`;

const PERMIT_QUERY = gql`
  query {
    Permit {
      PermitType
      surfaceHolePoint {
        latitude
        longitude
      }
      bottomHolePoint {
        latitude
        longitude
      }
      approvedDate {
        date
      }
      submittedDate {
        date
      }
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
  const [value, setValue] = useState('Anderson');
  const [inputValue, setInputValue] = useState('');
  const {
    data: nameData,
    loading: nameQueryLoading,
    error: nameQueryError,
  } = useQuery(ALL_COUNTY_QUERY);
  const [
    getCounty,
    { data: County, loading: countyQueryLoading, error: countyQueryError },
  ] = useLazyQuery(COUNTY_QUERY);
  const {
    data: Permit,
    loading: permitQueryLoading,
    error: permitQueryError,
  } = useQuery(PERMIT_QUERY);
  const [countyGeo, setCountyGeo] = useState(null);

  const layers = [];

  const cityLayer = new GeoJsonLayer({
    id: 'city-of-Midland',
    data: cityOfMidland,
    stroked: true,
    lineWidthMinPixels: 1,
    filled: false,
    getLineColor: [0, 0, 250],
  });

  const queryCountyGeo = async (value) => {
    const { name } = value;
    await getCounty({
      variables: { name },
    });
  };

  useEffect(() => {
    if (County) {
      IsJsonString(County.County[0].geometry)
        ? setCountyGeo(JSON.parse(County.County[0].geometry))
        : setCountyGeo('');
    }
  }, [County]);

  if (permitQueryLoading || nameQueryLoading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress size={100} />
      </div>
    );

  if (countyQueryError || permitQueryError || nameQueryError)
    return <div>Something went wrong</div>;

  const layerData = Permit.Permit.map((p) => {
    const { surfaceHolePoint } = p;
    return {
      name: p.PermitType,
      coordinates: [surfaceHolePoint.longitude, surfaceHolePoint.latitude],
      submittedDate: p.submittedDate.date.split('T')[0],
      approvedDate: p.approvedDate.date.split('T')[0],
    };
  });

  const permitLayer = new ScatterplotLayer({
    id: 'permit-layer',
    data: layerData,
    pickable: true,
    stroked: true,
    radiusMinPixels: 4,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => [255, 0, 0],
  });

  if (County) {
    const countyLayer = new GeoJsonLayer({
      id: 'county-layer',
      data: countyGeo,
      stroked: true,
      lineWidthMinPixels: 1,
      filled: false,
      getLineColor: [52, 168, 50],
    });
    layers.push(countyLayer);
  }

  const countyNames = nameData.County.map((c, index) => ({
    name: c.name,
    id: index,
  }));

  return (
    <Grid container spacing={0} className={classes.root} id='map-controls'>
      <Grid
        item
        xs={12}
        id='map-controls-grid-container'
        className={classes.controls}
      >
        <Typography variant='h6'>Map Controls</Typography>
        <hr className={classes.hr} />
        <Autocomplete
          value={value}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          id='controllable-states-demo'
          options={countyNames}
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label='Select County' variant='outlined' />
          )}
        />
        <Button
          variant='contained'
          color='primary'
          className={classes.button}
          onClick={() => queryCountyGeo(value)}
        >
          Select County
        </Button>
        {countyQueryLoading && <div>...Loading County Data</div>}
      </Grid>
      <Grid item xs={12} id='map-grid-container' className={classes.map}>
        <Map layers={[...layers, cityLayer, permitLayer]} />
      </Grid>
    </Grid>
  );
};

export default MapControls;
