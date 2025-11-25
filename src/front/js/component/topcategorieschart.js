import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TopCategoriesChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchTopCategories = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/top-categories`); 
                const data = await response.json();

                const labels = data.map(item => item.category);
                const values = data.map(item => item.total_sold);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: "Ventas por Categoría",
                            data: values,
                            borderColor: "rgba(75, 192, 192, 1)",
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            fill: true,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching top categories:", error);
            }
        };

        fetchTopCategories();
    }, []);

    if (!chartData) return <p>Cargando datos del gráfico...</p>;

    return (
        <div>
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: "Categorías Más Vendidas" },
                    },
                }}
            />
        </div>
    );
};

export default TopCategoriesChart;
