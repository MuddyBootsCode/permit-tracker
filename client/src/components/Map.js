import React from 'react';
import DeckGL from 'deck.gl';
import {
  StaticMap,
  NavigationControl,
  _MapContext as MapContext,
} from 'react-map-gl';

const INITIAL_VIEW_STATE = {
  longitude: -102.024326,
  latitude: 31.870896,
  pitch: 0,
  zoom: 9.5,
  bearing: 0,
};

const Map = ({ layers = [], mapStyle }) => {
  const [viewPort, setViewPort] = React.useState({
    ...INITIAL_VIEW_STATE,
  });

  return (
    <DeckGL
      layers={layers}
      ContextProvider={MapContext.Provider}
      {...viewPort}
      onViewportChange={(viewPort) => {
        setViewPort(viewPort);
      }}
      controller={true}
      initialViewState={viewPort}
      height={'100vh'}
      width={'100vw'}
      getTooltip={({ object }) => {
        if (
          object &&
          object.type === 'Feature' &&
          object.properties.border_type === 'city'
        ) {
          return {
            html: `<div>${object.properties.name} City Limit</div>`,
          };
        }

        if (object && object.type === 'Feature') {
          return {
            html: `<div> ${object.properties.name} County</div>`,
          };
        }

        if (object && object.type === 'Permit') {
          return {
            html: `
              <div>Operator: ${object.Operator}</div>
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
          };
        }
      }}
    >
      <StaticMap
        mapboxApiAccessToken={process.env.REACT_APP_MAP_BOX_TOKEN}
        mapStyle={mapStyle.url}
      />
      <div style={{ position: 'absolute', zIndex: 1, right: 10 }}>
        <NavigationControl />
      </div>
    </DeckGL>
  );
};

export default Map;
