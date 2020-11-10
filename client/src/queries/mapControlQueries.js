import { gql } from '@apollo/client';

const COUNTY_QUERY = gql`
  query County($name: String) {
    County(name: $name) {
      name
      geometry
    }
  }
`;

const ALL_COUNTY_QUERY = gql`
  query {
    County(orderBy: name_asc) {
      name
    }
  }
`;

const PERMIT_QUERY = gql`
  query {
    Permit {
      PermitType
      OperatorAlias
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

export { PERMIT_QUERY, COUNTY_QUERY, ALL_COUNTY_QUERY };
