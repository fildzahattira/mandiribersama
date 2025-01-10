import styles from './card.module.css'

const Card = ({title,number}) => {
    return (
        <div className={styles.container}>
            <div className={styles.texts}>  
                <span className={styles.title}>{title}</span>
                <span className={styles.number}>{number}</span>
            </div>
        </div>
    )
}


export default Card
