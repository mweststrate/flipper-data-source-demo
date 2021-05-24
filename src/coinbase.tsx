/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @format
 */

export type CoinUpdate = {
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
  let count = 0;

  socket.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.product_id && msg.price) {
        onMessage(msg);
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
