import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

export default function WeightChart({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted">
        <p className="text-[15px] font-medium">Aucune donnée</p>
      </div>
    )
  }

  // Safe temporal sort
  const sortedEntries = [...entries].sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return da - db;
  });

  const data = {
    labels: sortedEntries.map(e => {
      const d = new Date(e.date)
      if (isNaN(d.getTime())) return e.date // fallback label
      return `${d.getDate()}/${d.getMonth() + 1}`
    }),
    datasets: [
      {
        fill: true,
        label: 'Poids (kg)',
        data: sortedEntries.map(e => e.weight),
        borderColor: '#0A84FF',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(10, 132, 255, 0.2)');
          gradient.addColorStop(1, 'rgba(10, 132, 255, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#1C1C1E',
        pointBorderColor: '#0A84FF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#0A84FF',
      },
    ],
  }

  const weights = sortedEntries.map(e => e.weight).filter(w => w != null && !isNaN(w))
  const minWeight = weights.length ? Math.min(...weights) : 50
  const maxWeight = weights.length ? Math.max(...weights) : 100
  
  const minScale = Math.floor(minWeight - 2)
  const maxScale = Math.ceil(maxWeight + 2)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 10, bottom: 0, left: 0, right: 10 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        titleColor: '#8E8E93',
        bodyColor: '#FFFFFF',
        bodyFont: { size: 15, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} kg`
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8E8E93', font: { size: 11 }, maxRotation: 45 },
        border: { display: false }
      },
      y: {
        min: minScale,
        max: maxScale,
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#8E8E93', font: { size: 11 }, stepSize: 2 },
        border: { display: false }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  return <Line data={data} options={options} />
}
