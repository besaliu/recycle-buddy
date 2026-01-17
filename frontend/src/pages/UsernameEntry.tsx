import { motion } from "motion/react";
import { Recycle, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./UsernameEntry.module.css";
import { 
  getUserIdFromCookie, 
  setUserIdCookie, 
  createUser, 
  getUser 
} from "../services/api";

interface UsernameEntryProps {
  onSubmit: (username: string, userId: string) => void;
}

export function UsernameEntry({ onSubmit }: UsernameEntryProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already has a UUID in cookies
    const checkExistingUser = async () => {
      const userId = getUserIdFromCookie();
      
      if (userId) {
        try {
          const response = await getUser(userId);
          // User exists, redirect to welcome page
          onSubmit(response.user.username, userId);
        } catch (err) {
          // UUID exists but user not found in database, clear cookie
          document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkExistingUser();
  }, [onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await createUser(username.trim());
      // Save UUID to cookie
      setUserIdCookie(response.userId);
      // Navigate to welcome page
      onSubmit(response.user.username, response.userId);
    } catch (err: any) {
      // Handle username already exists error
      if (err.message.includes('already exists') || err.message.includes('User already exists')) {
        setError("This username is already taken. Please choose another one.");
      } else {
        setError(err.message || "Failed to create user. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  // Dev mode: Skip authentication
  const handleDevSkip = () => {
    onSubmit("Dev User", "dev-mode-uuid");
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className={styles.logoContainer}
        >
          <div className={styles.logoWrapper}>
            <div className={styles.logo}>
              <Recycle className={styles.logoIcon} strokeWidth={3} />
            </div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.subtitle}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

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
            onChange={(e) => {
              setUsername(e.target.value);
              setError(""); // Clear error when user types
            }}
            placeholder="Enter your name..."
            className={styles.input}
            autoFocus
            disabled={isSubmitting}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorMessage}
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          disabled={!username.trim() || isSubmitting}
          className={`${styles.submitButton} ${
            isSubmitting 
              ? styles.submitting 
              : !username.trim() 
              ? styles.submitButtonDisabled 
              : ""
          }`}
        >
          <span>{isSubmitting ? 'Creating...' : "Let's Go!"}</span>
          {isSubmitting ? (
            <Loader2 className={`${styles.buttonIcon} ${styles.spinning}`} strokeWidth={2.5} />
          ) : (
            <ArrowRight className={styles.buttonIcon} strokeWidth={2.5} />
          )}
        </motion.button>
      </motion.form>

      {/* Dev Mode Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={handleDevSkip}
        className={styles.devButton}
      >
        🚀 Dev Mode - Skip Auth
      </motion.button>
    </div>
  );
}
