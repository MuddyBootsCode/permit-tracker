import React, { useEffect, useState } from 'react';
import Map from './Map';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  FormControl,
  Slider,
  Typography,
} from '@material-ui/core';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import { cityOfMidland } from '../data/cityOfMidland';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';

dayjs.extend(isBetween);

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

const marks = [
  {
    value: 0,
    label: 'Jan',
  },
  {
    value: 31,
    label: 'Feb',
  },
  {
    value: 60,
    label: 'Mar',
  },
  {
    value: 91,
    label: 'April',
  },
  {
    value: 121,
    label: 'May',
  },
  {
    value: 152,
    label: 'June',
  },
  {
    value: 182,
    label: 'July',
  },
  {
    value: 213,
    label: 'Aug',
  },
  {
    value: 244,
    label: 'Sept',
  },
  {
    value: 274,
    label: 'Oct',
  },
  {
    value: 305,
    label: 'Nov',
  },
  {
    value: 335,
    label: 'Dec',
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
  const [dateRange, setDateRange] = useState([0, 365]);
  const [startDate, setStartDate] = useState('01/01/2017');
  const [endDate, setEndDate] = useState('12/31/2017');
  const [permitData, setPermitData] = useState([]);
  const [filteredPermitData, setFilteredPermitData] = useState([]);
  const [numberOfPermits, setNumberOfPermits] = useState(0);
  const [mapStyle, setMapStyle] = useState({
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v10',
  });
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

  const valueLabelFormat = (dateRange) => {
    const date = new Date(2017, 0, dateRange);
    const newString = date.toLocaleDateString();
    return newString;
  };

  const ValueLabelComponent = (props) => {
    const { children, open, value } = props;

    return (
      <Tooltip open={open} enterTouchDelay={0} placement='top' title={value}>
        {children}
      </Tooltip>
    );
  };

  const dateValueChange = (event, newValue) => {
    setDateRange(newValue);
    setStartDate(valueLabelFormat(dateRange[0]));
    setEndDate(valueLabelFormat(dateRange[1]));

    const dateFilteredPermits = [...permitData].filter((d) =>
      dayjs(d.submittedDate).isBetween(startDate, endDate)
    );
    setFilteredPermitData(dateFilteredPermits);
    setNumberOfPermits(dateFilteredPermits.length);
  };

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

    if (Permit) {
      setNumberOfPermits(Permit.Permit.length);
      const layerData = Permit.Permit.map((p) => {
        const { surfaceHolePoint } = p;
        return {
          name: p.PermitType,
          coordinates: [surfaceHolePoint.longitude, surfaceHolePoint.latitude],
          submittedDate: p.submittedDate.date.split('T')[0],
          approvedDate: p.approvedDate.date.split('T')[0],
        };
      });
      setPermitData(layerData);
      setFilteredPermitData(layerData);
    }
  }, [County, Permit]);

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

  const permitLayer = new ScatterplotLayer({
    id: 'permit-layer',
    data: filteredPermitData,
    pickable: true,
    stroked: true,
    radiusMinPixels: 2.5,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => [255, 0, 0],
  });

  if (County) {
    const countyLayer = new GeoJsonLayer({
      id: 'county-layer',
      data: countyGeo,
      stroked: true,
      lineWidthMinPixels: 2,
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
        <Grid item xs={12}>
          <div
            style={{
              display: 'flex',
              marginBottom: 15,
            }}
          >
            <Autocomplete
              value={value}
              getOptionLabel={(option) => (option.name ? option.name : '')}
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
                <TextField
                  {...params}
                  label='Select County'
                  variant='outlined'
                />
              )}
            />
            <Button
              variant='contained'
              color='primary'
              className={classes.button}
              onClick={() => queryCountyGeo(value)}
              style={{ marginLeft: 15 }}
            >
              Select County
            </Button>
            <div style={{ marginLeft: 20 }}>
              <FormControl>
                <InputLabel>Map Style</InputLabel>
                <Select
                  lable='Map Style'
                  value={mapStyle}
                  onChange={(event, newValue) => {
                    setMapStyle(newValue.props.value);
                  }}
                >
                  {MapStyles.map((style) => {
                    return <MenuItem value={style}>{style.name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              {countyQueryLoading && <div>...Loading County Data</div>}
            </div>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Typography
            id='range-slider'
            gutterBottom
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Permit Date Range - 2017 <br /> Start Date: {startDate} <br /> End
            Date: {endDate} <br /> Number of Permits in Range: {numberOfPermits}
          </Typography>
          <br />
          <br />
          <div>
            <Slider
              value={dateRange}
              onChange={dateValueChange}
              valueLabelDisplay='off'
              ValueLabelComponent={ValueLabelComponent}
              style={{ width: 600 }}
              valueLabelFormat={valueLabelFormat}
              max={365}
              min={1}
              step={1}
              marks={marks}
            />
          </div>
        </Grid>
      </Grid>
      <Grid item xs={12} id='map-grid-container' className={classes.map}>
        <Map layers={[...layers, cityLayer, permitLayer]} mapStyle={mapStyle} />
      </Grid>
    </Grid>
  );
};
export default MapControls;
