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

export function Coins() {
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState(() => initialData);

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(function addRow(event) {
        setRows((rows) => [...rows, event]);
      });
    }
    return () => {};
  }, [active]);

  // view criteria
  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState(false);
  const [sticky, setSticky] = useState(false);

  // apply filter / sort
  let visibleRows = rows;
  if (search) visibleRows = visibleRows.filter(filterCoinsBy(search));
  if (sorted) visibleRows = visibleRows.sort(sortCoinsByPrice);

  // sticky scroll
  const parentRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (sticky) {
      parentRef.current!.lastElementChild?.scrollIntoView();
    }
  });

  // render
  return (
    <div>
      {/* prettier-ignore */}
      <Toolbar {...{active, setActive, search, setSearch, sorted, setSorted, sticky, setSticky, }} />
      <div className="table" ref={parentRef}>
        {visibleRows.map((row, index) => (
          <Row row={row} key={'' + index} />
        ))}
      </div>
    </div>
  );
}
