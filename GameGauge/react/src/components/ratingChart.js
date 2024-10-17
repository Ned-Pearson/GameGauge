import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // For Chart.js registration

const RatingChart = ({ individualRatings, averageRating, totalRatings }) => {
  // Calculate rating frequencies (1-10) from individualRatings
  const ratingFrequencies = Array(10).fill(0); // Initializing 10 bins for ratings from 1 to 10
  individualRatings.forEach(rating => {
    if (rating >= 1 && rating <= 10) {
      ratingFrequencies[rating - 1] += 1; // Increment frequency at the correct index
    }
  });

  const chartData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    datasets: [
      {
        label: '', // Empty label to hide the legend
        data: ratingFrequencies,
        backgroundColor: ratingFrequencies.map((_, idx) => {
          if (idx < 2) return 'blue';  // Ratings 1-2
          if (idx < 4) return 'green'; // Ratings 3-4
          if (idx < 6) return 'yellow'; // Ratings 5-6
          if (idx < 8) return 'orange'; // Ratings 7-8
          return 'red'; // Ratings 9-10
        }),
        hoverBackgroundColor: '#000', // Optional hover effect
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        callbacks: {
          label: (context) => `Count: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
            display : true, // Show x-axis labels (confusing when theres no values)
        //  display: false, // Hide x-axis labels (1-10)
        
        },
        grid: {
          display: true, // left the grid lines for x-axis so the chart itself is easier to see (especially with no values)
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          display: false, // Hide y-axis labels (0-maxcount)
        },
        grid: {
          display: false, // Remove grid lines for y-axis
        },
      },
    },
  };

  return (
    <div>
      <h3>Average Rating: {averageRating}/10</h3>
      <h4>Total Ratings: {totalRatings}</h4>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default RatingChart;
