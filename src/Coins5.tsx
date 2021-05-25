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
  const visibleRows = useRef(rows.current);
  const filter = useRef((_c: CoinUpdate) => true);
  const sortBy = useRef<undefined | ((c: CoinUpdate) => number)>();
  const [, forceUpdate] = useState(0);
  const window = useRef([0, 50]);

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(function addRow(event) {
        rows.current.push(event);
        if (filter.current(event)) {
          let index;
          if (sortBy.current) {
            index = sortedLastIndexBy(
              visibleRows.current,
              event,
              sortBy.current,
            );
            visibleRows.current.splice(index, 0, event);
          } else {
            index = visibleRows.current.length;
            visibleRows.current.push(event);
          }
          if (index > window.current[0] && index <= window.current[1]) {
            console.log('visible');
            forceUpdate((x) => x + 1);
          } else {
            if (visibleRows.current.length % 100 === 0) {
              forceUpdate((x) => x + 1);
            }
          }
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
    visibleRows.current = rows.current.filter(filter.current);
  }, [search]);
  useEffect(() => {
    sortBy.current = sorted ? (p) => p.price : undefined;
    const visibles = rows.current.filter(filter.current);
    visibleRows.current = sorted ? visibles.sort(sortCoinsByPrice) : visibles;
  }, [sorted]);

  // sticky scroll
  const parentRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (sticky) {
      rowVirtualizer.scrollToIndex(visibleRows.current.length - 1);
    }
  });

  const rowVirtualizer = useVirtual({
    size: visibleRows.current.length,
    parentRef,
    estimateSize: rowHeight,
  });

  // store visible window
  const startIndex = rowVirtualizer.virtualItems[0]?.index ?? 0;
  window.current = [
    startIndex,
    startIndex + rowVirtualizer.virtualItems.length,
  ];

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
              <Row row={visibleRows.current[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const rowHeight = () => 18;
