import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

interface SparklineChartProps {
  data: number[]
  color?: string
  height?: number
}

export function SparklineChart({ data, color = '#a78bfa', height = 40 }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }))
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
        <YAxis domain={['dataMin', 'dataMax']} hide />
      </LineChart>
    </ResponsiveContainer>
  )
}
