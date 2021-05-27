/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useState} from 'react';
import {
  CoinUpdate,
  filterCoinsBy,
  initialData,
  streamCoinbase,
} from './coinbase';
import {Toolbar} from './Toolbar';
import {Row} from './Row';
import {DataSourceRendererVirtual, createDataSource} from 'flipper-data-source';

export function Coins() {
  const [active, setActive] = useState(false);
  const [dataSource] = useState(() => createDataSource(initialData));

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(function addRow(event) {
        dataSource.append(event);
      });
    }
    return () => {};
  }, [active]);

  // view criteria
  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState(false);
  const [sticky, setSticky] = useState(false);

  // apply filter / sort
  useEffect(() => {
    dataSource.view.setFilter(search ? filterCoinsBy(search) : undefined);
  }, [search]);
  useEffect(() => {
    dataSource.view.setSortBy(sorted ? (p) => p.price : undefined);
  }, [sorted]);

  // render
  return (
    <div>
      {/* prettier-ignore */}
      <Toolbar {...{active, setActive, search, setSearch, sorted, setSorted, sticky, setSticky, }} />
      <div className="table2">
        <DataSourceRendererVirtual
          dataSource={dataSource}
          useFixedRowHeight
          defaultRowHeight={18}
          itemRenderer={rowRenderer}
          autoScroll={sticky}
        />
      </div>
    </div>
  );
}

function rowRenderer(row: CoinUpdate) {
  return <Row row={row} />;
}
