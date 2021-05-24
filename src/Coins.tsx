/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';
import {
  CoinUpdate,
  initialData,
  sortCoinsByPrice,
  streamCoinbase,
} from './coinbase';
import {Toolbar} from './Toolbar';
import {Row} from './Row';

export function Coins() {
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState<CoinUpdate[]>(() => initialData);

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
  if (search) visibleRows = visibleRows.filter((r) => r.data.includes(search));
  if (sorted) visibleRows = visibleRows.sort(sortCoinsByPrice);

  // sticky scroll
  const parentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
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
