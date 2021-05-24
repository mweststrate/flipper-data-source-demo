/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {CoinUpdate} from './coinbase';

export function Row({row}: {row: CoinUpdate}) {
  return (
    <div className="row">
      <div>{row.product_id}</div>
      <div>{row.price}</div>
    </div>
  );
}
