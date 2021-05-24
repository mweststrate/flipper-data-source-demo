/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';
import {streamCoinbase} from './coinbase';
import {useVirtual} from 'react-virtual';

export type RowData = {
  product_id: string,
  price: number,
};

export const ROW_HEIGHT = 18;

function sortRowsByPrice(a: RowData, b: RowData) {
  return b.price - a.price;
}

const rowHeight = () => ROW_HEIGHT;

export function CBVirtual() {
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState<RowData[]>([]);

  // we do this with refs to not interfere with normal react lifecycle method
  const counterRef = useRef<HTMLDivElement | null>(null);
  const count = useRef(0);

  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState(false);
  const [sticky, setSticky] = useState(false);

  // apply filter / sort
  let visibleRows = rows;
  if (search)
    visibleRows = visibleRows.filter(r => r.product_id.includes(search));
  if (sorted) visibleRows = visibleRows.sort(sortRowsByPrice);

  // react-virtual
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtual({
    size: visibleRows.length,
    parentRef,
    estimateSize: rowHeight,
  });

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(event => {
        count.current += 1;
        if (counterRef.current) {
          counterRef.current.innerText = '' + count.current;
        }
        setRows(rows => [
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
      <div className="table" ref={parentRef}>
        <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: '100%',
            position: 'relative',
          }}>
          {rowVirtualizer.virtualItems.map(virtualRow => (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}>
              <Row row={visibleRows[virtualRow.index]} />
            </div>
          ))}
        </div>
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
