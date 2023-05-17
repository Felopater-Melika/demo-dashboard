import React, {useEffect, useState} from 'react';
import {
    Select,
    MenuItem,
    Box,
    TableContainer,
    Table,
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody, Modal
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../src/components/shared/DashboardCard';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TransactionData {
    month: string;
    source: string;
    transactionAmount: number;
}
const SalesOverview = () => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalData, setModalData] = React.useState<Array<TransactionData>>([]);

    // fetch data from Google Sheets
    const [sheetData, setSheetData] = useState<Array<TransactionData>>([]);

    useEffect(() => {
        fetch('/api/fetchData')
            .then(response => response.json())
            .then(data => setSheetData(data));
    }, []);
    // process data for chart
    const categories = Array.from(new Set(sheetData.map(data => data.month)));
    // const series = ['X', 'Y', 'Z'].map(source => ({
    //     name: `Transactions from source ${source}`,
    //     data: categories.map(month => {
    //         const transactions = sheetData.filter(data => data.month === month && data.source === source);
    //         return transactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
    //     }),
    // }));

    // select
    const [month, setMonth] = React.useState('1');

    const handleChange = (event: any) => {
        setMonth(event.target.value);
    };

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // chart
    const optionscolumnchart: any = {
        chart: {
            events: {
                click: function(event: any, chartContext: any, config: any) {
                    const source = ['X', 'Y', 'Z'][config.seriesIndex];
                    const month = categories[config.dataPointIndex];
                    const transactions = sheetData.filter(data => data.month === month && data.source === source);
                    setModalData(transactions);
                    setModalOpen(true);
                },
            },
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [primary, secondary],
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: '60%',
                columnWidth: '42%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },

        stroke: {
            show: true,
            width: 5,
            lineCap: "butt",
            colors: ["transparent"],
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        yaxis: {
            tickAmount: 4,
        },
        xaxis: {
            categories: Array.from(new Set(sheetData.map(data => data.month))),
            axisBorder: {
                show: false,
            },
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
    };

    const seriescolumnchart: any = ['X', 'Y', 'Z'].map(source => ({
        name: `Transactions from source ${source}`,
        data: Array.from(new Set(sheetData.map(data => data.month))).map(month => {
            const transactions = sheetData.filter(data => data.month === month && data.source === source);
            return transactions.reduce((total, transaction) => total + transaction.transactionAmount, 0);
        }),
    }));

    return (
        <DashboardCard title="Sales Overview" action={
            <Select
                labelId="month-dd"
                id="month-dd"
                value={month}
                size="small"
                onChange={handleChange}
            >
                <MenuItem value={1}>January 2023</MenuItem>
                <MenuItem value={2}>February 2023</MenuItem>
                <MenuItem value={3}>March 2023</MenuItem>
            </Select>
        }>
            <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height="370px"
            />
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '70%',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        overflow: 'auto'
                    }}
                >
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Month</TableCell>
                                    <TableCell align="center">Source</TableCell>
                                    <TableCell align="center">Transaction Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {modalData.map((row, index) => (
                                    <TableRow
                                        key={index+1}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row" align="center">
                                            {row.month}
                                        </TableCell>
                                        <TableCell align="center">{row.source}</TableCell>
                                        <TableCell align="center">{row.transactionAmount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Modal>
        </DashboardCard>
    );
};

export default SalesOverview;
