/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';
import {streamCoinbase} from './coinbase';
import {DataSource, DataSourceRendererVirtual} from 'flipper-data-source';
import {RowData, Row, ROW_HEIGHT} from './CBVirtual';

export function CBDataSource() {
  const [active, setActive] = useState(false);
  const [dataSource] = useState(() => new DataSource<RowData>(undefined));

  // we do this with refs to not interfere with normal react lifecycle method
  const counterRef = useRef<HTMLDivElement | null>(null);
  const count = useRef(0);

  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState(false);
  const [sticky, setSticky] = useState(false);

  // apply filter / sort
  useEffect(() => {
    dataSource.view.setFilter(
      search ? r => r.product_id.includes(search) : undefined,
    );
  }, [search]);
  useEffect(() => {
    dataSource.view.setSortBy(sorted ? 'price' : undefined);
  }, [sorted]);

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(event => {
        count.current += 1;
        if (counterRef.current) {
          counterRef.current.innerText = '' + count.current;
        }
        dataSource.append({
          product_id: event.product_id,
          price: parseFloat(event.price),
        });
      });
    }
    return () => {};
  }, [active]);

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => setActive(!active)}>
          {active ? 'Stop' : 'Start'}
        </button>
        Filter by coin:
        <input
          value={search}
          onChange={e => {
            setSearch(e.target.value);
          }}></input>
        <input
          type="checkbox"
          checked={sorted}
          onChange={() => setSorted(!sorted)}
        />
        Sort by price
        <input
          type="checkbox"
          checked={sticky}
          onChange={() => setSticky(!sticky)}
        />
        Tail
      </div>
      <div ref={counterRef} className="counter">
        0
      </div>
      <div className="table">
        <div style={{height: 500, display: 'flex'}}>
          <DataSourceRendererVirtual
            dataSource={dataSource}
            useFixedRowHeight
            defaultRowHeight={ROW_HEIGHT}
            itemRenderer={rowRenderer}
            autoScroll={sticky}
          />
        </div>
      </div>
    </div>
  );
}

function rowRenderer(row: RowData) {
  return <Row row={row} />;
}
