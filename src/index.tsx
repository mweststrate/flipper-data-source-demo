/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import {CBRaw} from './CBRaw';
import {CBVirtual} from './CBVirtual';
import {CBDataSource} from './CBDataSource';
import { BasicChart } from './BasicChart';
import { DataSourceChart } from './DataSourceChart';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

function App() {
  return (
    <div className="App">
      <div className="container">
        <h1>Raw HTML manipulation</h1>
        <CBRaw />
      </div>
      <div className="container">
        <h1>Virtualization</h1>
        <CBVirtual />
      </div>
      <div className="container">
        <h1>DataSource</h1>
        <CBDataSource />
      </div>
      <div className="container">
        <h1>Chart</h1>
        <BasicChart />
      </div>
      <div className="container">
        <h1>DataSource powered Chart</h1>
        <DataSourceChart />
      </div>
    </div>
  );
}
