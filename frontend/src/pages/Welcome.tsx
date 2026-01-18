import { motion } from "motion/react";
import { Recycle, Scan, TreeDeciduous } from "lucide-react";
import styles from "./Welcome.module.css";

interface WelcomeProps {
  username: string;
  onNavigate: (page: string) => void;
}

export function Welcome({ username, onNavigate }: WelcomeProps) {
  return (
    <div className={styles.container}>
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className={styles.logoContainer}
      >
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>
            <Recycle className={styles.logoIcon} strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className={styles.title}
      >
        Recycle Buddy
      </motion.h1>

      {/* Welcome Message */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className={styles.welcomeText}
      >
        Welcome, {username}!
      </motion.p>

      {/* Action Buttons */}
      <div className={styles.buttonContainer}>
        {/* Scan Trash Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("scan")}
          className={`${styles.button} ${styles.scanButton}`}
        >
          <div className={styles.iconWrapper}>
            <Scan strokeWidth={2.5} />
          </div>
          <span>Scan Your Trash</span>
        </motion.button>

        {/* Community Tree Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("community")}
          className={`${styles.button} ${styles.communityButton}`}
        >
          <div className={styles.iconWrapper}>
            <TreeDeciduous strokeWidth={2.5} />
          </div>
          <span>Community Forest</span>
        </motion.button>
      </div>
    </div>
  );
}
