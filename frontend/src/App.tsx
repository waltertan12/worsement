import React, { useState, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

interface Account {
    cash: number;
    buyingPower: number;
    multiplier: number;
    equity: number;
}

interface Order {
    symbol: number;
    quantity: number;
}

interface Response<T> {
    data: T;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {},
    appBarSpacer: theme.mixins.toolbar,
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    title: {
        flexGrow: 1,
    },
}));

function App() {
    const classes = useStyles();
    const [account, setAccount] = useState<Account | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const getAccount = async () => {
            const res = await fetch('http://localhost:3001/api/account');
            const json = (await res.json()) as Response<Account>;

            setAccount(json.data);
        };
        const getOrders = async () => {
            const res = await fetch('http://localhost:3001/api/orders');
            const json = (await res.json()) as Response<Order[]>;

            setOrders(json.data);
        };

        getAccount();
        getOrders();
    }, []);

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <Typography component="h1" variant="h6" className={classes.title}>
                        Okayishment
                    </Typography>
                </Toolbar>
            </AppBar>
            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Container maxWidth="lg" className={classes.container}>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Paper className={classes.paper}>
                                <Typography component="h2" variant="h6">
                                    Account Info:
                                </Typography>
                                <List>
                                    {account &&
                                        Object.entries(account).map(([a, b]) => (
                                            <ListItem key={a}>
                                                <ListItemText>
                                                    {a}: {b}
                                                </ListItemText>
                                            </ListItem>
                                        ))}
                                </List>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper className={classes.paper}>
                                <Typography component="h2" variant="h6">
                                    Orders:
                                </Typography>
                                <List>
                                    {orders.map((order: Order) => (
                                        <ListItem key={order.symbol}>
                                            <ListItemText>
                                                {order.symbol}: {order.quantity}
                                            </ListItemText>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </main>
        </div>
    );
}

export default App;
