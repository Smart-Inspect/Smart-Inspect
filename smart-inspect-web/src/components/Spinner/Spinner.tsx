import styles from './Spinner.module.css';

const Logo = () => {
    return (
        <div className={`${styles['spinner']} ${styles['center']}`}>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
            <div className={styles['spinner-blade']}></div>
        </div>
    );
};

export default Logo;