import React from 'react';
import DeckGL from 'deck.gl';
import {
  StaticMap,
  NavigationControl,
  _MapContext as MapContext,
} from 'react-map-gl';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { cityOfMidland } from '../data/cityOfMidland';
import { gql, useQuery } from '@apollo/client';
import { CircularProgress } from '@material-ui/core';

const INITIAL_VIEW_STATE = {
  longitude: -102.024326,
  latitude: 31.870896,
  pitch: 0,
  zoom: 9.5,
  bearing: 0,
};

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

const Map = ({ county }) => {
  const { data, loading, error } = useQuery(PERMIT_QUERY);
  const [viewPort, setViewPort] = React.useState({
    ...INITIAL_VIEW_STATE,
  });

  if (loading)
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

  if (error) return <div>Something went wrong</div>;

  const layerData = data.Permit.map((p) => {
    const { surfaceHolePoint } = p;
    return {
      name: p.PermitType,
      coordinates: [surfaceHolePoint.longitude, surfaceHolePoint.latitude],
      submittedDate: p.submittedDate.date.split('T')[0],
      approvedDate: p.approvedDate.date.split('T')[0],
    };
  });

  return (
    <DeckGL
      ContextProvider={MapContext.Provider}
      {...viewPort}
      onViewportChange={(viewPort) => {
        setViewPort(viewPort);
      }}
      controller={true}
      initialViewState={viewPort}
      height={'100vh'}
      width={'100vw'}
      getTooltip={({ object }) =>
        object && {
          html: `
              <div>Permit Type: ${object.name}
              <br/>Lat: ${!object.coordinates ? 'N/A' : object.coordinates[1]}
              <br/>Long: ${!object.coordinates ? 'N/A' : object.coordinates[0]}
              <br/>Submitted Date: ${
                !object.submittedDate ? 'N/A' : object.submittedDate
              }
              <br/>Approved Date: ${
                !object.approvedDate ? 'N/A' : object.approvedDate
              }
              </div>`,
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
          },
        }
      }
    >
      <StaticMap
        mapboxApiAccessToken={process.env.REACT_APP_MAP_BOX_TOKEN}
        mapStyle='mapbox://styles/mapbox/dark-v10'
      />
      <div style={{ position: 'absolute', zIndex: 1, right: 0 }}>
        <NavigationControl />
      </div>
      {county && (
        <GeoJsonLayer
          id='county'
          data={county}
          pickable={false}
          stroked={true}
          lineWidthMinPixels={2}
          filled={false}
          getLineColor={[52, 168, 50]}
        />
      )}
      <GeoJsonLayer
        id='city-of-midland'
        data={cityOfMidland}
        pickable={false}
        stroked={true}
        lineWidthMinPixels={1}
        filled={false}
        getLineColor={[0, 0, 250]}
      />
      <ScatterplotLayer
        id='permit-layer'
        data={layerData}
        pickable={true}
        stroked={true}
        radiusMinPixels={4}
        getPosition={(d) => d.coordinates}
        getFillColor={(d) => [255, 0, 0]}
      />
    </DeckGL>
  );
};

export default Map;
