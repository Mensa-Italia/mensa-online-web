<script setup>

import {Line} from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js'
import {GetUserChart} from "@/api.js";
import {ref} from "vue";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    Filler
)


const chartData = ref({
  labels: [],
  datasets: [{data: []}]
});

GetUserChart().then((data) => {
  console.log(data);
  const labels = data.map((d) => d.day);
  const datasets = data.map((d) => d.users);
  chartData.value = {
    labels: labels,
    datasets: [{
      label: 'Active Users',
      backgroundColor: 'rgba(75, 192, 192, .1)',
      borderColor: 'rgba(75, 192, 192, 1)',
      data: datasets,
      cubicInterpolationMode: 'monotone',
      tension: 0.4,
      fill: true,
    }]
  }
})


const chartOptions = {
  responsive: true,
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
    }
  },
  scales: {
    y: {
      display: false,
      grid: {
        display: false
      },
      ticks: {
        display: false
      },
    },
    x: {
      display: false,
      grid: {
        display: false
      },
      ticks: {
        display: false
      },
    },
  },
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    },
    grid: {
      display: false
    },
    tooltips: {
      enabled: false
    },
  },
  maintainAspectRatio: true,
}

</script>

<template>
  <div class="chart">
    <h3>Active Users</h3>
    <div class="chart-container">
      <div class="changed-value">
        {{  Math.abs(chartData.datasets[0].data[chartData.datasets[0].data.length - 1] - chartData.datasets[0].data[chartData.datasets[0].data.length - 2]) }}
      </div>
      <div class="chart-data">
        <Line
            id="my-chart-id"
            :options="chartOptions"
            :data="chartData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  background-color: rgba(75, 192, 192, .1);
  border-radius: 10px;
  aspect-ratio: 16/9;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

h3 {
  margin: 0;
  margin-top: 10px;
  margin-left: 20px;
  padding: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.chart-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex: 1;
}

.changed-value {
  font-size: 2rem;
  font-weight: bold;
  padding: 1rem;
  padding-top: 0;
  flex: 1;
  min-width: 50%;
}

.chart-data {
  display: flex;
  flex-direction: column;
  justify-content: end;
  position: absolute;
  bottom: -10px;
  top: -10px;
  right: -10px;
  left: -10px;
}
</style>