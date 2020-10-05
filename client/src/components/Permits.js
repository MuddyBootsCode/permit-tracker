import React from 'react';
import Map from '../components/Map';
import { gql, useQuery } from '@apollo/client';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { cityOfMidland } from '../data/cityOfMidland';
import { texasCounties } from '../data/texasCounties';

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

const Permits = () => {
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

  const permitLayer = new ScatterplotLayer({
    id: 'permit-data-layer',
    data: layerData,
    stroked: false,
    radiusMinPixels: 2,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => [255, 0, 0],
  });

  const cityData = cityOfMidland;

  const cityLayer = new GeoJsonLayer({
    id: 'cityLayer',
    data: cityData,
    pickable: true,
    stroked: true,
    lineWidthMinPixels: 2,
    filled: false,
  });

  const layers = [permitLayer, cityLayer];

  return <Map layers={layers} />;
};

export default Permits;
