import Card from '../ui/dashboard/card/card'
import styles from "../ui/dashboard/dashboard.module.css"
const Dashboard = () => {
  const cardData = [
    { id: 1, title: 'Total Invoice', number: '148' },
    { id: 2, title: 'Total User', number: '2' },
    // { id: 3, title: 'Total Draft Invoice', number: '3' }
  ];

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
    )
  }
  
  export default Dashboard