/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

type RawCoinUpdate = {
  type: 'done' | 'received' | 'open';
  side: string;
  product_id: string;
  time: string;
  sequence: number;
  order_id: string;
  order_type: string;
  size: string;
  price: string;
  client_oid: string;
};

export type CoinUpdate = {
  product_id: string;
  price: number;
  data: string;
};

export const initialData: CoinUpdate[] = require('./data.json');

let count = initialData.length;

export function streamCoinbase(
  onMessage: (event: CoinUpdate) => void,
  product_ids = ['BTC-USD', 'BTC-GBP', 'BTC-EUR'],
) {
  const socket = new WebSocket('wss://ws-feed.pro.coinbase.com');

  const subPayload = {
    type: 'subscribe',
    product_ids,
    channels: ['full'],
  };

  console.log('start stream');
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify(subPayload));
  });

  socket.addEventListener('error', (error) => {
    console.error('Socket error', error);
  });

  let counterNode: HTMLElement | null;
  let last = performance.now();

  socket.addEventListener('message', (event) => {
    try {
      const msg: RawCoinUpdate = JSON.parse(event.data);
      if (msg.product_id && msg.price) {
        onMessage({
          product_id: msg.product_id,
          price: parseFloat(msg.price),
          data: event.data,
        });
      }
    } catch (err) {
      console.error('Failed to parse message', event.data, err);
    }

    // show stats
    if (!counterNode) {
      counterNode = document.getElementById('counter');
    }
    if (counterNode) {
      const n = performance.now();
      counterNode.innerText = `${Math.round(
        1000 / (n - last),
      )} items/sec. ${++count} total`;
      last = n;
    }
  });

  return () => {
    console.log('stop stream');
    socket.close();
  };
}

export function sortCoinsByPrice(a: CoinUpdate, b: CoinUpdate) {
  return b.price - a.price;
}
