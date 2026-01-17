import { motion } from "motion/react";
import { Recycle, ArrowRight } from "lucide-react";
import { useState } from "react";
import styles from "./UsernameEntry.module.css";

interface UsernameEntryProps {
  onSubmit: (username: string) => void;
}

export function UsernameEntry({ onSubmit }: UsernameEntryProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
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
        transition={{ delay: 0.3, duration: 0.6 }}
        className={styles.title}
      >
        Recycle Buddy
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className={styles.subtitle}
      >
        Let's get started!
      </motion.p>

      {/* Username Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className={styles.form}
      >
        {/* Input Field */}
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            What's your name?
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name..."
            className={styles.input}
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!username.trim()}
          className={`${styles.submitButton} ${!username.trim() ? styles.submitButtonDisabled : ""}`}
        >
          <span>Let's Go!</span>
          <ArrowRight className={styles.buttonIcon} strokeWidth={2.5} />
        </motion.button>
      </motion.form>
    </div>
  );
}
