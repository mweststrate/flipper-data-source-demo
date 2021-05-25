/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState, useLayoutEffect} from 'react';
import {
  CoinUpdate,
  filterCoinsBy,
  initialData,
  sortCoinsByPrice,
  streamCoinbase,
} from './coinbase';
import {Toolbar} from './Toolbar';
import {Row} from './Row';
import {useVirtual} from 'react-virtual';

export function Coins() {
  const [active, setActive] = useState(false);
  const rows = useRef(initialData);
  const [visibleRows, setVisibleRows] = useState<CoinUpdate[]>(
    () => initialData,
  );
  const filter = useRef((_c: CoinUpdate) => true);

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(function addRow(event) {
        rows.current.push(event);
        if (filter.current(event)) {
          setVisibleRows((visibleRows) => [...visibleRows, event]);
        }
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
    filter.current = filterCoinsBy(search);
    setVisibleRows(rows.current.filter(filter.current));
  }, [search]);

  // sticky scroll
  const parentRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (sticky) {
      rowVirtualizer.scrollToIndex(visibleRows.length - 1);
    }
  });

  const rowVirtualizer = useVirtual({
    size: visibleRows.length,
    parentRef,
    estimateSize: rowHeight,
  });

  // render
  return (
    <div>
      {/* prettier-ignore */}
      <Toolbar {...{active, setActive, search, setSearch, sorted, setSorted, sticky, setSticky, }} />
      <div className="table" ref={parentRef}>
        <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: '100%',
            position: 'relative',
          }}>
          {rowVirtualizer.virtualItems.map((virtualRow) => (
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

const rowHeight = () => 18;
