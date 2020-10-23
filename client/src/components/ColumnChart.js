import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ColumnChart = ({ data, operators }) => {
  const chartData = useMemo(
    () =>
      operators
        .map((operator) => {
          let color = '';
          const total = data.reduce((accumulator, record) => {
            if (record.Operator === operator) {
              accumulator += 1;
              color = `rgb(${record.color.join(',')})`;
            }
            return accumulator;
          }, 0);

          if (total !== 0) {
            return {
              name: operator,
              permits: total,
              color,
            };
          }
        })
        .sort((a, b) => b.permits - a.permits),
    [data]
  );

  console.log(chartData);

  return (
    <BarChart
      width={1200}
      height={300}
      data={chartData.filter((i) => i !== undefined)}
      margin={{ top: 10, right: 30, left: 40, bottom: 200 }}
    >
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='name' angle={-40} textAnchor='end' interval={0} />
      <YAxis />
      <Tooltip />
      <Bar dataKey='permits'>
        {chartData.map((entry, index) => {
          if (entry) {
            return <Cell key={`cell-${index}`} fill={entry.color} />;
          }
        })}
      </Bar>
    </BarChart>
  );
};

export default ColumnChart;
