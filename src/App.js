import { Button, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import OrderBook from './components/orderBook';


function App() {
  const [currencyPair, setCurrencyPair] = useState('BTCUSD');
  const [quantity, setQuantity] = useState(0);
  const [buyPrice, setResultBuyPrice] = useState('');
  const [sellPrice, setResultSellPrice] = useState('');
  const [latency, setResultLatency] = useState('');
  const [limitOrders, setLimitOrders] = useState([{}]);
  const [operation, setOperation] = useState('BUY');

  const openOrderBookWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws/order-book`);
    let startTime;
    ws.onopen = () => {
      startTime = window.performance.now();
      let data = {
        currencyPair: currencyPair,
        quantity: quantity
      }
      ws.send(JSON.stringify(data));
    };
    ws.onmessage = (event) => {
      const latency = window.performance.now() - startTime;
      const eventData = JSON.parse(event.data);
      setResultBuyPrice(eventData.buy_price.toFixed(5));
      setResultSellPrice(eventData.sell_price.toFixed(5));
      setResultLatency(latency.toFixed(4));
    };
  };

  const openLimitOrderWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws/limit-order`);
    let startTime;
    ws.onopen = () => {
      startTime = window.performance.now();
      let data = {
        currencyPair: currencyPair,
        quantity: quantity,
        operation: operation
      }
      ws.send(JSON.stringify(data));
    };
    ws.onmessage = (event) => {
      const latency = window.performance.now() - startTime;
      const eventData = JSON.parse(event.data);
      setLimitOrders(eventData.limit_orders);
      setResultLatency(latency.toFixed(4));
    };
  };

  return (
    <div className="App">
      <FormControl variant="outlined" style={{ marginBottom: '20px', marginTop: '30px' }}>
        <InputLabel>Currency Pair</InputLabel>
        <Select value={currencyPair} onChange={e => setCurrencyPair(e.target.value)}>
          <MenuItem value="BTCUSD">BTCUSD</MenuItem>
          <MenuItem value="ETHUSD">ETHUSD</MenuItem>
          {/* Add more options as needed */}
        </Select>
      </FormControl>
      <br />
      <TextField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        variant="outlined"
        style={{ marginBottom: '20px' }}
      />
      <br />
      <Button variant="contained" color="primary" onClick={openOrderBookWebSocket}>Send</Button>
      <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
        <Typography variant="h6">Buy Price: {buyPrice}</Typography>
        <Typography variant="h6">Sell Price: {sellPrice}</Typography>
        <Typography variant="h6">Latency: {latency} ms</Typography>
      </Paper>

      <br />
      <FormControl variant="outlined" style={{ marginBottom: '20px', marginTop: '30px' }}>
        <InputLabel>Operation</InputLabel>
        <Select value={operation} onChange={e => setOperation(e.target.value)}>
          <MenuItem value="BUY">BUY</MenuItem>
          <MenuItem value="SELL">SELL</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={openLimitOrderWebSocket}>Get Limit Orders</Button>
      </FormControl>
      <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
        {/* {limitOrders.map((item, i) => (
          <Typography variant="h6" key={i}> Price: {item.price} Quantity: {item.amount} Exchange: {item.exchange}</Typography>
        ))} */}
        {limitOrders.length > 0 ? <OrderBook
          orders={limitOrders}
          operation={operation}
          currencyPair={currencyPair} /> : <p>No orders available.</p>}
      </Paper>
    </div>
  );
}

export default App;