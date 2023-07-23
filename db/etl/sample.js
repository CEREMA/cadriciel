module.exports = {
  source: {
    plugin: 'geojson',
    config: {
      source: 'data/files/BassinHydrographique_FXX.json',
    },
  },
  destination: {
    plugin: 'postgres',
    config: {
      uri: 'postgresql://postgres:postgres@localhost:3535/postgres',
      table: 'bassins',
    },
  },
  map: {
    'properties.LbBH': 'title',
    'properties.NumCircAdminBassin': 'numcircadminbassin',
    'geometry.type': 'type',
    'geometry.coordinates': {
      field: 'geometry',
      type: 'json',
      render: (value, o) => {
        const result = {
          type: o.type,
          coordinates: value,
        };
        return JSON.stringify(result);
      },
    },
  },
};
