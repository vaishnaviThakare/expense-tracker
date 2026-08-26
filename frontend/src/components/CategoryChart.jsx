import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getCategoryColor } from '../utils/categoryColors';

function CategoryChart({ data }) {
  return (
    <PieChart width={260} height={260}>
      <Pie data={data} dataKey="total" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={2}>
        {data.map((entry, i) => <Cell key={i} fill={getCategoryColor(entry.name)} />)}
      </Pie>
      <Tooltip
        formatter={(value) => `₹${Number(value).toFixed(2)}`}
        contentStyle={{ background: '#FFFFFF', border: '1px solid #DCE5DF', borderRadius: 8, color: '#142019' }}
      />
    </PieChart>
  );
}

export default CategoryChart;