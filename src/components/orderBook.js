import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import React from 'react';
import OrderRow from './orderRow';

const OrderBook = ({ orders, operation, currencyPair }) => {
    const renderTime = Date.now();
    return (< Table >
        <TableBody>
            {orders.map((order, i) => (
                <OrderRow key={`${order.price}-${order.quantity}-${i}-${renderTime}`}
                    order={order}
                    operation={operation}
                    currencyPair={currencyPair} />
            ))}
        </TableBody>
    </Table >)
};

export default OrderBook;