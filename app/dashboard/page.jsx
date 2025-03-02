'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';
import Card from '../ui/dashboard/card/card';
import styles from "../ui/dashboard/dashboard.module.css";

const COLORS = ['#0088FE', '#FFBB28', '#df2c14']; // Fixed color code
const USER_COLORS = ['#00C49F', '#FF8042'];

const Dashboard = () => {
  const [userCount, setUserCount] = useState('Loading...');
  const [invoiceCount, setInvoiceCount] = useState('Loading...');
  const [invoiceChartData, setInvoiceChartData] = useState([]);
  const [userChartData, setUserChartData] = useState([]);
  const [monthlyInvoiceData, setMonthlyInvoiceData] = useState([]);
  const [adminRole, setAdminRole] = useState('');
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("/api/auth", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setAdminRole(data.admin_role);
        setAdminId(data.admin_id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = adminRole === 'Admin' ? `/api/dashboard?admin_id=${adminId}` : '/api/dashboard';
        const response = await fetch(endpoint);
        const data = await response.json();

        setUserCount(data.totalUsers);
        setInvoiceCount(adminRole === 'Admin' ? data.totalInvoicesByRoleAdmin : data.totalInvoices);

        // Fixed invoice chart data
        setInvoiceChartData([
          { name: 'Active', value: adminRole === 'Admin' ? data.activeInvoicesByRoleAdmin : data.activeInvoices },
          { name: 'Approval', value: adminRole === 'Admin' ? data.needApproveInvoicesByRoleAdmin : data.needApproveInvoices },
          { name: 'Archive', value: adminRole === 'Admin' ? data.deletedInvoicesByRoleAdmin : data.deletedInvoices },
        ]);

        setUserChartData([
          { name: 'Active', value: data.activeAdmins },
          { name: 'NonActive', value: data.inactiveAdmins },
        ]);

        setMonthlyInvoiceData(data.monthlyInvoices.map(item => ({
          month: item.month,
          invoices: item.count
        })));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (adminRole) {
      fetchData();
    }
  }, [adminRole, adminId]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
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
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight="bold">
                  {invoiceCount}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {adminRole === 'Super Admin' && (
            <>
              <Card title="Monthly Invoice Created">
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
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight="bold">
                      {userCount}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;