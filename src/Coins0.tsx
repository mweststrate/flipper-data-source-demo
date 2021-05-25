/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState, useLayoutEffect} from 'react';
import {streamCoinbase} from './coinbase';
import {Toolbar} from './Toolbar';

export function Coins() {
  const [active, setActive] = useState(false);

  // listen to coin stream
  useEffect(() => {
    if (active) {
      return streamCoinbase(function addRow(event) {
        // No-op
      });
    }
    return () => {};
  }, [active]);

  // view criteria
  const [search, setSearch] = useState('');
  const [sorted, setSorted] = useState(false);
  const [sticky, setSticky] = useState(false);

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
      <div className="table" ref={parentRef}></div>
    </div>
  );
}
