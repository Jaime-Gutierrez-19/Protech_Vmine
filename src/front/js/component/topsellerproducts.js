import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";
import { Doughnut } from 'react-chartjs-2';
import {Chart as ChartJS, ArcElement, Tooltip, Legend,} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';


const TopSellerProductsChart = () => {
    const {store, actions} = useContext(Context)
    const [topProducts, setTopProducts] = useState([]);
    
    ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

    useEffect(() => {
        const fetchTopProducts = async () => {
            const token = actions.verifyTokenSeller();
            try {
                const response = await fetch(process.env.BACKEND_URL + '/api/seller/top-products',{
                    headers:{
                        "Authorization": `Bearer ${token}`
                    }
                }); 
                const data = await response.json();
                setTopProducts(data); 
                
            } catch (error) {
                console.error('Error fetching top products:', error);
            }
        };

        fetchTopProducts();
    }, []);

    const chartData = {
        labels: topProducts.map(product => product.product_name), 
        datasets: [
        {
            label: 'Ventas por producto',
            data: topProducts.map(product => product.total_sold), 
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
            hoverBackgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
        },
        ],
    };
    const chartOptions = {
        responsive: true,
        cutout: '70%',
        plugins: {
            datalabels: {
                color: '#fff', 
                font: {
                  weight: 'bold',
                  size: 16,
                },
                formatter: (value, context) => {
                  const label = context.chart.data.labels[context.dataIndex]; 
                  return `${value}`; 
                },
                // Mostrar las etiquetas en el centro de la dona
                align: 'center',
                anchor: 'center',
            },
        },
    };

    return <Doughnut data={chartData} options={chartOptions} />;
};

export default TopSellerProductsChart;