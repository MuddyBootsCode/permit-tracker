import React from 'react';
import DeckGL from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { midlandCounty } from '../data/midlandCounty';
import { cityOfMidland } from '../data/cityOfMidland';
import { gql, useQuery } from '@apollo/client';

const INITIAL_VIEW_STATE = {
  longitude: -102.024326,
  latitude: 31.870896,
  pitch: 0,
  zoom: 9,
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
    }
  }
`;

const Map = () => {
  const [toolTip, setToolTip] = React.useState({});

  const onClick = (info) => {
    console.log(info, ' from on click');
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.name}`);
    }
  };

  const { data, loading, error } = useQuery(PERMIT_QUERY);

  if (loading) return <div>...Loading</div>;

  if (error) return <div>Something went wrong</div>;

  const layerData = data.Permit.map((p) => {
    const { surfaceHolePoint } = p;
    return {
      name: p.PermitType,
      coordinates: [surfaceHolePoint.longitude, surfaceHolePoint.latitude],
    };
  });

  console.log(toolTip, ' Tool tip');

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={({ object }) => object && object.name}
    >
      <StaticMap
        mapboxApiAccessToken={process.env.REACT_APP_MAP_BOX_TOKEN}
        preventStyleDiffing={true}
      />
      <GeoJsonLayer
        id='county-of-midland'
        data={midlandCounty}
        pickable={true}
        stroked={true}
        lineWidthMinPixels={2}
        filled={false}
      />
      <GeoJsonLayer
        id='city-of-midland'
        data={cityOfMidland}
        pickable={true}
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
        onClick={onClick}
        onHover={(info) => setToolTip(info)}
      />
    </DeckGL>
  );
};

export default Map;
