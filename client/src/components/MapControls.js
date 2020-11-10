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
import { GPUGridLayer } from '@deck.gl/aggregation-layers';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import ColumnChart from './ColumnChart';
import { ResponsiveContainer } from 'recharts';
import {
  ALL_COUNTY_QUERY,
  COUNTY_QUERY,
  PERMIT_QUERY,
} from '../queries/mapControlQueries';
import { MapStyles, marks } from '../utils/mapSelections';

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

const geoLayer = (geoData) => {
  return new GeoJsonLayer({
    id: 'county-layer',
    data: geoData,
    pickable: true,
    stroked: true,
    lineWidthMinPixels: 2,
    filled: false,
    getLineColor: [52, 168, 50],
  });
};

const randomBetween = (min = 50, max = 255) =>
  min + Math.floor(Math.random() * (max - min + 1));

const MapControls = () => {
  const classes = useStyles();
  const [mapLayers, setMapLayers] = useState([]);
  // const [operatorFilter, setOperatorFilter] = useState('');
  const [countyValue, setCountyValue] = useState('Anderson');
  const [featureLayer, setFeatureLayer] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const [inputValue, setInputValue] = useState('');
  const [dateRange, setDateRange] = useState([0, 365]);
  const [startDate, setStartDate] = useState('01/01/2017');
  const [endDate, setEndDate] = useState('12/31/2017');
  const [permitData, setPermitData] = useState([]);
  const [filteredPermitData, setFilteredPermitData] = useState([]);
  const [numberOfPermits, setNumberOfPermits] = useState(0);
  const [operators, setOperators] = useState([]);
  const [mapStyle, setMapStyle] = useState({
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v10',
  });
  // const {
  //   data: nameData,
  //   loading: nameQueryLoading,
  //   error: nameQueryError,
  // } = useQuery(ALL_COUNTY_QUERY);
  // const [
  //   getCounty,
  //   { loading: countyQueryLoading, error: countyQueryError },
  // ] = useLazyQuery(COUNTY_QUERY, {
  //   onCompleted: (data) => {
  //     const newFeatureLayer = {
  //       ...featureLayer,
  //       features: [
  //         ...featureLayer.features,
  //         {
  //           type: 'Feature',
  //           properties: {
  //             name: countyValue.name,
  //           },
  //           geometry: JSON.parse(data.County[0].geometry),
  //         },
  //       ],
  //     };
  //     setFeatureLayer(newFeatureLayer);
  //     let newLayer = geoLayer(newFeatureLayer);
  //     setMapLayers([...mapLayers, newLayer]);
  //   },
  // });
  const {
    data: Permit,
    loading: permitQueryLoading,
    error: permitQueryError,
  } = useQuery(PERMIT_QUERY);

  const valueLabelFormat = (dateRange) => {
    const date = new Date(2017, 0, dateRange);
    return date.toLocaleDateString();
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

  // const filterByOperator = (operator) => {
  //   setOperatorFilter(operator);
  //   const updatedData = [...filteredPermitData].filter(
  //     (permit) => permit.operator === operatorFilter
  //   );
  //   console.log(updatedData);
  // };

  const cityLayer = new GeoJsonLayer({
    id: 'city-of-Midland',
    data: cityOfMidland,
    pickable: true,
    stroked: true,
    lineWidthMinPixels: 1,
    filled: false,
    getLineColor: [0, 0, 250],
  });

  useEffect(() => {
    if (Permit) {
      setNumberOfPermits(Permit.Permit.length);
      const OperatorColors = {};
      let operators = new Set(Permit.Permit.map((p) => p.OperatorAlias));
      setOperators([...operators]);
      [...operators].forEach((o) => {
        OperatorColors[`${o}`] = [
          randomBetween(),
          randomBetween(),
          randomBetween(),
        ];
      });
      const layerData = Permit.Permit.map((p) => {
        const { surfaceHolePoint } = p;
        return {
          type: 'Permit',
          name: p.PermitType,
          coordinates: [surfaceHolePoint.longitude, surfaceHolePoint.latitude],
          submittedDate: p.submittedDate.date.split('T')[0],
          approvedDate: p.approvedDate.date.split('T')[0],
          operator: p.OperatorAlias,
          color: OperatorColors[p.OperatorAlias],
        };
      });
      setPermitData(layerData);
      setFilteredPermitData(layerData);
    }
  }, [Permit]);

  if (permitQueryLoading)
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
        <CircularProgress size={200} />
      </div>
    );

  if (permitQueryError) return <div>Something went wrong</div>;

  // const countyNames = nameData.County.map((c, index) => ({
  //   name: c.name,
  //   id: index,
  // }));

  // const permitLayer = new ScatterplotLayer({
  //   id: 'permit-layer',
  //   data: filteredPermitData,
  //   pickable: true,
  //   stroked: true,
  //   radiusMinPixels: 2.5,
  //   getPosition: (d) => d.coordinates,
  //   getFillColor: (d) => d.color,
  // });

  const permitLayer = new GPUGridLayer({
    id: 'permit-layer',
    data: filteredPermitData,
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: (d) => d.coordinates,
  });

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
            {/*<Autocomplete*/}
            {/*  value={countyValue}*/}
            {/*  getOptionLabel={(option) => (option.name ? option.name : '')}*/}
            {/*  onChange={(event, newValue) => {*/}
            {/*    setCountyValue(newValue);*/}
            {/*  }}*/}
            {/*  inputValue={inputValue}*/}
            {/*  onInputChange={(event, newInputValue) => {*/}
            {/*    setInputValue(newInputValue);*/}
            {/*  }}*/}
            {/*  id='county-auto-complete'*/}
            {/*  options={countyNames}*/}
            {/*  style={{ width: 300 }}*/}
            {/*  renderInput={(params) => (*/}
            {/*    <TextField*/}
            {/*      {...params}*/}
            {/*      label='Select County'*/}
            {/*      variant='outlined'*/}
            {/*    />*/}
            {/*  )}*/}
            {/*/>*/}
            {/*<Button*/}
            {/*  variant='contained'*/}
            {/*  color='primary'*/}
            {/*  className={classes.button}*/}
            {/*  disabled={countyQueryLoading}*/}
            {/*  onClick={() =>*/}
            {/*    getCounty({ variables: { name: countyValue.name } })*/}
            {/*  }*/}
            {/*  style={{ marginLeft: 15 }}*/}
            {/*>*/}
            {/*  Select County*/}
            {/*</Button>*/}
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
                    return (
                      <MenuItem value={style} key={style.name}>
                        {style.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
        </Grid>
        {/*<Grid item xs={12}>*/}
        {/*  <Typography*/}
        {/*    id='range-slider'*/}
        {/*    gutterBottom*/}
        {/*    style={{*/}
        {/*      display: 'flex',*/}
        {/*      alignItems: 'center',*/}
        {/*      justifyContent: 'center',*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    Permit Date Range - 2017 <br /> Start Date: {startDate} <br /> End*/}
        {/*    Date: {endDate} <br /> Number of Permits in Range: {numberOfPermits}*/}
        {/*  </Typography>*/}
        {/*  <br />*/}
        {/*  <br />*/}
        {/*  <div>*/}
        {/*<Slider*/}
        {/*  value={dateRange}*/}
        {/*  onChange={dateValueChange}*/}
        {/*  valueLabelDisplay='off'*/}
        {/*  ValueLabelComponent={ValueLabelComponent}*/}
        {/*  style={{ width: 800 }}*/}
        {/*  valueLabelFormat={valueLabelFormat}*/}
        {/*  max={365}*/}
        {/*  min={1}*/}
        {/*  step={1}*/}
        {/*  marks={marks}*/}
        {/*/>*/}
        {/*  </div>*/}
        {/*</Grid>*/}
        {/*<Grid item xs={12}>*/}
        {/*  <ResponsiveContainer width={1200} height='100%'>*/}
        {/*    /!*<ColumnChart*!/*/}
        {/*    /!*  data={filteredPermitData}*!/*/}
        {/*    /!*  operators={operators}*!/*/}
        {/*    /!*  // filter={filterByOperator}*!/*/}
        {/*/>*/}
        {/*  </ResponsiveContainer>*/}
        {/*</Grid>*/}
      </Grid>

      <Grid item xs={12} id='map-grid-container' className={classes.map}>
        <Map
          layers={[...mapLayers, permitLayer, cityLayer]}
          mapStyle={mapStyle}
        />
      </Grid>
    </Grid>
  );
};
export default MapControls;
