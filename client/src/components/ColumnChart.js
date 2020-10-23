import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const ColumnChart = ({ data, operators }) => {
  const chartData = [];

  operators.forEach((operator) => {
    let color = '';
    const total = data.reduce((accumulator, record) => {
      if (record.Operator === operator) {
        accumulator += 1;
        color = `rgb(${record.color.join(',')})`;
      }
      return accumulator;
    }, 0);

    const row = {
      name: operator,
      permits: total,
      color,
    };
    chartData.push(row);
  });

  return (
    <BarChart
      width={1200}
      height={300}
      data={chartData.filter((bar) => bar.permits !== 0)}
      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey='name' />
      <YAxis />
      <Tooltip />
      <Bar dataKey='permits'>
        {chartData.map((entry, index, props) => {
          // console.log(entry);
          // console.log(props);
          return <Cell key={`cell-${index}`} fill={entry.color} />;
        })}
      </Bar>
    </BarChart>
  );
};

export default ColumnChart;
