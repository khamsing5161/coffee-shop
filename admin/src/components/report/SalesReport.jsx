import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

function SalesReport() {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const d = await axios.get("http://localhost:5000/api/report/daily");
    const m = await axios.get("http://localhost:5000/api/report/monthly");
    const y = await axios.get("http://localhost:5000/api/report/yearly");

    setDaily(d.data);
    setMonthly(m.data);
    setYearly(y.data);
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen" style={{ marginTop: "5rem", backgroundColor: "#FFF9E9" }}>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">
        📊 Sales Report (รายงานยอดขาย)
      </h1>

      {/* DAILY SALES */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">ยอดขายรายวัน</h2>

        <Bar
          data={{
            labels: daily.map((d) => d.day),
            datasets: [
              {
                label: "Daily Revenue (Kip)",
                data: daily.map((d) => d.total),
              },
            ],
          }}
        />
      </div>

      {/* MONTHLY SALES */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">ยอดขายรายเดือน</h2>

        <Line
          data={{
            labels: monthly.map((m) => m.month),
            datasets: [
              {
                label: "Monthly Revenue (Kip)",
                data: monthly.map((m) => m.total),
              },
            ],
          }}
        />
      </div>

      {/* YEARLY SALES */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">ยอดขายรายปี</h2>

        <Bar
          data={{
            labels: yearly.map((y) => y.year),
            datasets: [
              {
                label: "Yearly Revenue (Kip)",
                data: yearly.map((y) => y.total),
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

export default SalesReport;
