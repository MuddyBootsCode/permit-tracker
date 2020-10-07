import React, { useEffect } from 'react';
import Map from '../components/Map';
import { gql, useQuery } from '@apollo/client';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { cityOfMidland } from '../data/cityOfMidland';
import { midlandCounty } from '../data/midlandCounty';

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

  // useEffect(() => {
  //   try {
  //     const fetchData = async () => {
  //       const res = await fetch('https://data.cityofdenton.com/dataset/0c4fcbc0-6c9a-4c76-98e2-d29f918e31c6/resource/be1b384f-3b2e-4238-88a8-4410cb36f7fc/download/c8efcc13-b5b4-48b5-9873-933844822d6ctexascounties.geojson');
  //       console.log(res)
  //     };
  //     fetchData();
  //   } catch (error) {
  //   }
  // }, []);

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
    pickable: true,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => [255, 0, 0],
    getTooltip: ({ object }) =>
      object && {
        html: `<h3>$object.name</h3>`,
        style: {
          color: 'white',
          backgroundColor: '#000',
          fontSize: '0.8em',
        },
      },
  });

  const layers = [permitLayer];

  return <ScatterplotLayer id='permits-layer' data={layerData} />;
};

export default Permits;
