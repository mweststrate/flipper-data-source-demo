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
import {sortedLastIndexBy} from 'lodash';

export function Coins() {
  const [active, setActive] = useState(false);
  const rows = useRef(initialData);
  const [visibleRows, setVisibleRows] = useState(rows.current);
  const filter = useRef((_c: CoinUpdate) => true);
  const sortBy = useRef<undefined | ((c: CoinUpdate) => number)>();

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(function addRow(event) {
        rows.current.push(event);
        if (filter.current(event)) {
          setVisibleRows((visibleRows) => {
            if (sortBy.current) {
              const sortedRows = [...visibleRows];
              const index = sortedLastIndexBy(
                visibleRows,
                event,
                sortBy.current,
              );
              sortedRows.splice(index, 0, event);
              return sortedRows;
            }
            return [...visibleRows, event];
          });
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
  useEffect(() => {
    sortBy.current = sorted ? (p) => p.price : undefined;
    const visibles = rows.current.filter(filter.current);
    setVisibleRows(sorted ? visibles.sort(sortCoinsByPrice) : visibles);
  }, [sorted]);

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
