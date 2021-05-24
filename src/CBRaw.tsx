/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useLayoutEffect, useRef, useState} from 'react';
import {streamCoinbase} from './coinbase';

export function CBRaw() {
  const [active, setActive] = useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLDivElement | null>(null);
  const count = useRef(0);
  const [sticky, setSticky] = useState(false);

  // using layout effect as normal effect will get too much behind if if the divRef is still drawing...
  useLayoutEffect(() => {
    if (active) {
      return streamCoinbase(event => {
        count.current += 1;
        if (divRef.current) {
          const row = createRow(event.product_id, event.price);
          divRef.current.appendChild(row);
          if (sticky) {
            row.scrollIntoView();
          }
        }
        if (counterRef.current) {
          counterRef.current.innerText = '' + count.current;
        }
      });
    }
    return () => {};
  }, [active, sticky]);

  return (
    <div>
      <button onClick={() => setActive(!active)}>
        {active ? 'Stop' : 'Start'}
      </button>
      <input
        type="checkbox"
        checked={sticky}
        onChange={() => setSticky(!sticky)}
      />
      Tail
      <div ref={counterRef} className="counter">
        0
      </div>
      <div className="table">
        <div ref={divRef} />
      </div>
    </div>
  );
}

function createRow(product_id: string, price: string) {
  const newDiv = document.createElement('div');
  newDiv.className = 'row';
  const div1 = document.createElement('div');
  const div2 = document.createElement('div');
  div1.appendChild(document.createTextNode(product_id));
  div2.appendChild(document.createTextNode(price));
  newDiv.appendChild(div1);
  newDiv.appendChild(div2);
  return newDiv;
}
