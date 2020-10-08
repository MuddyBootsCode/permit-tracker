import React from 'react';
import Map from './Map';
import ContainerDimensions from 'react-container-dimensions';

const MapControls = () => {
  return (
    <div id='map-controls' style={{ position: 'relative' }}>
      <Map />
    </div>
  );
};

export default MapControls;
