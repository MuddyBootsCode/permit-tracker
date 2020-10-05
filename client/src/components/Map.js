import React from 'react';
import DeckGL from 'deck.gl';
import { StaticMap } from 'react-map-gl';

const INITIAL_VIEW_STATE = {
  longitude: -102.024326,
  latitude: 31.870896,
  pitch: 0,
  zoom: 9,
  bearing: 0,
};

const Map = ({ layers = [] }) => {
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAP_BOX_TOKEN} />
    </DeckGL>
  );
};

export default Map;
