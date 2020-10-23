import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

const ColumnChart = ({ data, operators }) => {
  const chartData = [];
  console.log(data, ' filtered permit data');

  operators.forEach((operator) => {
    let color = '';
    const total = data.reduce((accumulator, record) => {
      if (record.Operator === operator) {
        accumulator += 1;
        color = `rgb(${record.color.join(',')})`;
      }
      return accumulator;
    }, 0);

    if (total !== 0) {
      const row = {
        name: operator,
        permits: total,
        color,
      };
      chartData.push(row);
    }
  });

  return (
    <BarChart
      width={1200}
      height={300}
      data={chartData}
      margin={{ top: 10, right: 30, left: 20, bottom: 200 }}
    >
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='name' angle={-40} textAnchor='end' interval={0} />
      <YAxis />
      <Tooltip />
      <Bar dataKey='permits'>
        {chartData.map((entry, index) => {
          return <Cell key={`cell-${index}`} fill={entry.color} />;
        })}
      </Bar>
    </BarChart>
  );
};

export default ColumnChart;
