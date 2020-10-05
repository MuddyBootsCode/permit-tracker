import React from 'react';
import DeckGL from 'deck.gl';
import { StaticMap } from 'react-map-gl';

const INITIAL_VIEW_STATE = {
  longitude: -20,
  latitude: 0,
  pitch: 0,
  zoom: 2,
  bearing: 0,
};

console.log(process.env.REACT_APP_MAP_BOX_TOKEN);

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
