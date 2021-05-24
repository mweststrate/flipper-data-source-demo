/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {streamCoinbase} from './coinbase';
import {VictoryChart, VictoryLine, VictoryZoomContainer, VictoryBrushContainer} from 'victory';
import {DataSource} from 'flipper-data-source';

type Entry = {
  id: number,
  date: Date,
  product_id: string,
  price: number
}

// From victory
type DomainTuple = [number, number] | [Date, Date];
type ZoomDomain ={ x?: DomainTuple; y?: DomainTuple };

const SAMPLE_RATE = 100;

export function DataSourceChart() {
  const [active, setActive] = useState(false);

  const [datasource] = useState(() => new DataSource<Entry>(undefined));

  const [sampledRows, setSampledRows] = useState<Entry[]>([]);
  const [fullRows, setFullRows] = useState<Entry[]>([]);

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
        datasource.append({
          id: datasource.size,
          date: new Date(event.time),
          product_id: event.product_id,
          price: parseFloat(event.price),
        });
      }, ['BTC-USD']);
    }
    return () => {};
  }, [active]);

  // listen to sampled view
  useEffect(() => {
    datasource.view.setWindow(0, datasource.limit);
    datasource.view.setListener((event) => {
      if (event.type === 'shift') {
        if (event.index % SAMPLE_RATE === 0)
          setSampledRows(rows => [...rows, datasource.view.get(event.index)])
        if (event.location === 'in')
          setFullRows(rows => [...rows, datasource.view.get(event.index)])
      } else {
        console.warn("unhandle event" + event.type);
      }
    })
  }, [datasource])

  // update zoom level
  useEffect(() => {
    // @ts-ignore
    if (zoomDomain) {
      // @ts-ignore
      datasource.view.setWindow(zoomDomain.x[0], zoomDomain.x[1]);
      // @ts-ignore
      setFullRows(datasource.view.output());
    } else {
      datasource.view.setWindow(0, datasource.limit);
    }
  }, [datasource, zoomDomain])

  const handleZoom = useCallback((domain: ZoomDomain) => {
    setZoomDomain(domain);
  }, [])

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
          containerComponent={
            <VictoryZoomContainer responsive={false}
              zoomDimension="x"
              zoomDomain={zoomDomain}
            />
          }
          >
            <VictoryLine
            data={zoomDomain ? fullRows : sampledRows}
            x="id"
            y="price"
            />

          </VictoryChart>

          <VictoryChart
            width={500}
            height={90}
            padding={padding}
            containerComponent={
              <VictoryBrushContainer responsive={false}
                brushDimension="x"
                brushDomain={zoomDomain}
                onBrushDomainChange={handleZoom}
              />
            }
          >
            <VictoryLine              
              data={sampledRows}
              x="id"
              y="price"
            />
          </VictoryChart>
      </div>
    </div>
  );
}

const padding = {top: 0, left: 50, right: 50, bottom: 30};
