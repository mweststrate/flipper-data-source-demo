/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';
import {streamCoinbase} from './coinbase';
import {useVirtual} from 'react-virtual';

export type RowData = {
  product_id: string;
  price: number;
};

export const ROW_HEIGHT = 18;

function sortRowsByPrice(a: RowData, b: RowData) {
  return b.price - a.price;
}

const rowHeight = () => ROW_HEIGHT;

export function Coins() {
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState<RowData[]>([]);

  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState(false);
  const [sticky, setSticky] = useState(false);

  // apply filter / sort
  let visibleRows = rows;
  if (search)
    visibleRows = visibleRows.filter((r) => r.product_id.includes(search));
  if (sorted) visibleRows = visibleRows.sort(sortRowsByPrice);

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase((event) => {
        setRows((rows) => [
          ...rows,
          {
            product_id: event.product_id,
            price: parseFloat(event.price),
          },
        ]);
      });
    }
    return () => {};
  }, [active]);

  useEffect(() => {
    if (sticky) {
      rowVirtualizer.scrollToIndex(visibleRows.length - 1);
    }
  });

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => setActive(!active)}>
          {active ? 'Stop' : 'Start'}
        </button>
        Filter by coin:
        <input
          value={search}
          onChange={(e) => {
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
      <div className="table" ref={parentRef}>
        {visibleRows.map((virtualRow, index) => (
          <Row row={virtualRow} key={'' + index} />
        ))}
      </div>
    </div>
  );
}

export function Row({row}: {row: RowData}) {
  return (
    <div className="row">
      <div>{row.product_id}</div>
      <div>{row.price}</div>
    </div>
  );
}
