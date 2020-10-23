import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const ColumnChart = ({ data }) => {
  return (
    <BarChart
      width={1200}
      height={300}
      data={data}
      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey='name' />
      <YAxis />
      <Tooltip />
      <Bar dataKey='permits' stroke='rgb(255,0,0)' fill='rgb(0,0,255)' />
    </BarChart>
  );
};

export default ColumnChart;
