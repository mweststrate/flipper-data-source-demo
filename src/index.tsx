/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import {Coins} from './Coins0';

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
        <Coins />
        <div className="counter" id="counter" />
      </div>
    </div>
  );
}
