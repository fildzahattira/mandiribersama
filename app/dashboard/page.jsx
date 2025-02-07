'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';
import Card from '../ui/dashboard/card/card';
import styles from "../ui/dashboard/dashboard.module.css";

const COLORS = ['#0088FE', '#FFBB28']; // Warna untuk Invoice (Aktif & Dihapus)
const USER_COLORS = ['#00C49F', '#FF8042']; // Warna untuk User (Aktif & Tidak Aktif)

const Dashboard = () => {
  const [userCount, setUserCount] = useState('Loading...');
  const [invoiceCount, setInvoiceCount] = useState('Loading...');
  const [invoiceChartData, setInvoiceChartData] = useState([]);
  const [userChartData, setUserChartData] = useState([]);
  const [monthlyInvoiceData, setMonthlyInvoiceData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        // Simpan jumlah user & invoice
        setUserCount(data.totalUsers);
        setInvoiceCount(data.totalInvoices);

        // Data untuk Pie Chart Invoice
        setInvoiceChartData([
          { name: 'Active', value: data.activeInvoices },
          { name: 'Archive', value: data.deletedInvoices },
        ]);

        // Data untuk Pie Chart User
        setUserChartData([
          { name: 'Active', value: data.activeAdmins },
          { name: 'Non-Active', value: data.inactiveAdmins },
        ]);

        setMonthlyInvoiceData(data.monthlyInvoices.map(item => ({
          month: item.month,
          invoices: item.count
        })));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          {/* Card Total Invoice dengan Pie Chart */}
          <Card title="Total Invoice">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={invoiceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {invoiceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                {/* Menampilkan total invoice di tengah chart */}
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight="bold">
                  {invoiceCount}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </Card>

           {/* Grafik Invoice per Bulan dengan Line Chart */}
           <Card title="Monthly Total Invoice">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyInvoiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="invoices" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Card Total User dengan Pie Chart */}
          <Card title="Total User">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {userChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                {/* Menampilkan total invoice di tengah chart */}
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight="bold">
                  {userCount}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
