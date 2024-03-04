import { Button } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useRef, useState } from 'react';

const useStyles = makeStyles({
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: '#f4f4f4',
        },
        '&:hover': {
            backgroundColor: '#e8e8e8',
        },
    },
    cell: {
        padding: '15px',
        fontSize: '16px',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#3f51b5',
        color: '#fff',
        '&:hover': {
            backgroundColor: '#303f9f',
        },
    },
});

const OrderRow = ({ order, operation, currencyPair }) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [shouldPoll, setShouldPoll] = useState(false);
    const intervalRef = useRef(null);
    const orderIdRef = useRef(orderId);

    useEffect(() => {
        orderIdRef.current = orderId;
    }, [orderId]);

    useEffect(() => {
        const pollOrderStatus = () => {
            const ws = new WebSocket(`ws://localhost:8000/ws/get-limit-order-status`);
            ws.onopen = () => {
                ws.send(JSON.stringify({ orderId: orderIdRef.current }));
            };

            ws.onmessage = (event) => {
                const response = JSON.parse(event.data);
                console.log(response);
                setOrderStatus(response.status.toLowerCase());
                if (response.status.toLowerCase() === 'success' || response.status.toLowerCase() === 'failed') {
                    setLoading(false);
                    setShouldPoll(false); // Stop polling
                }
            };

            ws.onerror = (error) => {
                console.log(`WebSocket error: ${error}`);
                setLoading(false);
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed');
            };
        };

        if (shouldPoll) {
            intervalRef.current = setInterval(pollOrderStatus, 5000); // Poll every 5 seconds
        } else if (!shouldPoll && intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [shouldPoll, setOrderStatus, setLoading, setShouldPoll]);


    const executeOrder = () => {
        // Add the code to execute the order here
        console.log(`Executing order: ${order.id}`);
        setLoading(true);
        const ws = new WebSocket(`ws://localhost:8000/ws/execute-limit-order`);
        ws.onopen = () => {
            let orderData = {
                currency_pair: currencyPair,
                amount: order.amount,
                price: order.price,
                timestamp: 0,
                operation: operation,
                exchange: order.exchange,
            }
            console.log(orderData);
            ws.send(JSON.stringify(orderData));
        };
        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log(response);
            setOrderId(response.order_id);
            console.log("Set poll to true");
            setShouldPoll(true);
        };
        ws.onerror = (error) => {
            console.log(`WebSocket error: ${error}`);
            setLoading(false);
        }
        ws.onclose = () => {
            console.log('WebSocket closed');
        };
    };
    if (order)
        return (
            <TableRow className={classes.row}>
                <TableCell className={classes.cell}>{order.price}</TableCell>
                <TableCell className={classes.cell}>{parseFloat(order.amount).toFixed(4)}</TableCell>
                <TableCell className={classes.cell}>{order.exchange}</TableCell>
                <TableCell className={classes.cell}>
                    {loading ? (
                        <CircularProgress />
                    ) : orderStatus === 'success' ? (<div>Order Executed</div>
                    ) : orderStatus === 'failed' ? (<Button className={classes.button} onClick={executeOrder}>
                        Retry Order
                    </Button>
                    ) : (<Button className={classes.button} onClick={executeOrder}>
                        Execute Order
                    </Button>)}
                </TableCell>
            </TableRow>
        );
    else return (
        <TableRow className={classes.row}>
            <TableCell className={classes.cell}>0</TableCell>
            <TableCell className={classes.cell}>0</TableCell>
            <TableCell className={classes.cell}>EXCHANGE</TableCell>
            <TableCell className={classes.cell}>
                <Button className={classes.button} onClick={executeOrder} enabled={false}>
                    Execute Order
                </Button>
            </TableCell>
        </TableRow>
    );
};

export default OrderRow;