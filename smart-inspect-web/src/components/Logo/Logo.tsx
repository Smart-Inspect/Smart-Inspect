import styles from './Logo.module.css';
import logoWhite from '../../assets/smart-inspect_logo_white.png';
import logoBlack from '../../assets/smart-inspect_logo_black.png';

interface LogoProps {
    variant: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ variant }: LogoProps) => {
    return (
        <div className={styles.container}>
            <img className={styles.logo} src={variant === 'light' ? logoWhite : logoBlack} alt="Smart Inspect Logo" />
            <h1 className={variant === 'light' ? styles['title-white'] : styles['title-black']}>Smart</h1>
            <h2 className={variant === 'light' ? styles['description-white'] : styles['description-black']}>Inspect</h2>
        </div>
    );
};

export default Logo;