'use client';
import { useEffect, useState } from 'react';
import Card from '../ui/dashboard/card/card';
import styles from "../ui/dashboard/dashboard.module.css";

const Dashboard = () => {
  const [cardData, setCardData] = useState([
    { id: 1, title: 'Total Invoice', number: 'Loading...' },
    { id: 2, title: 'Total User', number: 'Loading...' },
  ]);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        // Update state dengan data dari API
        setCardData([
          { id: 1, title: 'Total Invoice', number: data.totalInvoices },
          { id: 2, title: 'Total User', number: data.totalUsers },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Jika gagal, tampilkan pesan error
        setCardData([
          { id: 1, title: 'Total Invoice', number: 'Error' },
          { id: 2, title: 'Total User', number: 'Error' },
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          {cardData.map(data => (
            <Card key={data.id} title={data.title} number={data.number} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;