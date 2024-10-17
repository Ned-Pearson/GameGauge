import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // For Chart.js registration

const RatingChart = ({ individualRatings, averageRating, totalRatings }) => {
  // Calculate rating frequencies (1-10) from individualRatings
  const ratingFrequencies = Array(10).fill(0); // Initializing 10 bins for ratings from 1 to 10
  individualRatings.forEach(rating => {
    // Ensure we're only working with valid ratings between 1 and 10
    if (rating >= 1 && rating <= 10) {
      ratingFrequencies[rating - 1] += 1; // Increment frequency at the correct index
    }
  });

  // Log frequency calculation for debugging
  console.log('Rating Frequencies:', ratingFrequencies);

  const chartData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    datasets: [
      {
        label: 'Ratings',
        data: ratingFrequencies, // Should now reflect the correct frequencies
        backgroundColor: ratingFrequencies.map((_, idx) => {
          // Assign cold-to-hot color based on rating
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

  console.log("Chart Data:", chartData); // Log chart data for debugging

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Count: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Ensure only whole numbers are displayed
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
