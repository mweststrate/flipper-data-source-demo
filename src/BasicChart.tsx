/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useEffect, useRef, useState} from 'react';
import {streamCoinbase} from './coinbase';
import {VictoryChart, VictoryLine, VictoryZoomContainer, VictoryBrushContainer} from 'victory';

type Entry = {
  date: Date,
  product_id: string,
  price: number
}

// From victory
type DomainTuple = [number, number] | [Date, Date];
type ZoomDomain ={ x?: DomainTuple; y?: DomainTuple };

export function BasicChart() {
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState<Entry[]>([]);

  // we do this with refs to not interfere with normal react lifecycle method
  const counterRef = useRef<HTMLDivElement | null>(null);
  const count = useRef(0);

  // @ts-ignore
  const [zoomDomain, setZoomDomain] = useState<ZoomDomain>(undefined);

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
            date: new Date(event.time),
            product_id: event.product_id,
            price: parseFloat(event.price),
          },
        ]);
      }, ['BTC-USD']);
    }
    return () => {};
  }, [active]);


  return (
    <div>
      <div className="toolbar">
        <button onClick={() => setActive(!active)}>
          {active ? 'Stop' : 'Start'}
        </button>
      </div>
      <div ref={counterRef} className="counter">
        0
      </div>
      <div>
        <VictoryChart
          width={500}
          height={500}
          scale={{x: "time"}}
          containerComponent={
            <VictoryZoomContainer responsive={false}
              zoomDimension="x"
              zoomDomain={zoomDomain}
            />
          }
          >
            <VictoryLine
            data={rows}
            x="date"
            y="price"
            />

          </VictoryChart>

          <VictoryChart
            width={500}
            height={90}
            scale={{x: "time"}}
            padding={{top: 0, left: 50, right: 50, bottom: 30}}
            containerComponent={
              <VictoryBrushContainer responsive={false}
                brushDimension="x"
                brushDomain={zoomDomain}
                onBrushDomainChange={setZoomDomain}
              />
            }
          >
            <VictoryLine              
              data={rows}
              x="date"
              y="price"
            />
          </VictoryChart>
      </div>
    </div>
  );
}
