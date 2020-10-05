import React from 'react';
import DeckGLMap from './DeckGLMap';
import { ScatterplotLayer } from '@deck.gl/layers';
import { gql } from '@apollo/client';

const PERMIT_QUERY = gql`
  query {
    Permit {
      id
    }
  }
`;

const Permits = () => {
  return <div></div>;
};

export default Permits;
