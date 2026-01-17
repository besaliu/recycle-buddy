import { motion } from "motion/react";
import { Camera, ArrowLeft, Send } from "lucide-react";
import { useState, useRef } from "react";
import styles from "./Scan.module.css";

interface ScanTrashProps {
  onBack: () => void;
}

export function ScanTrash({ onBack }: ScanTrashProps) {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log("Submitted:", { image, description });
    alert("Item scanned! 🎉");
  };

  return (
    <div className={styles.container}>
      {/* Header with Back Button */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={styles.header}
      >
        <button onClick={onBack} className={styles.backButton}>
          <div className={styles.backIconWrapper}>
            <ArrowLeft strokeWidth={3} />
          </div>
          <span>Back</span>
        </button>
      </motion.div>

      {/* Main Content - Centered */}
      <div className={styles.mainContent}>
        {/* Title */}
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className={styles.title}
        >
          Scan Your Item
        </motion.h2>

        {/* Image Preview or Camera Button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
          className={styles.imageSection}
        >
          {image ? (
            <div className={styles.imagePreview}>
              <div className={styles.imageContainer}>
                <img src={image} alt="Captured item" />
              </div>
              <button onClick={() => setImage(null)} className={styles.retakeButton}>
                Retake
              </button>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className={styles.hiddenInput}
              />
              <button onClick={() => fileInputRef.current?.click()} className={styles.cameraButton}>
                <div className={styles.cameraIconWrapper}>
                  <Camera strokeWidth={2.5} />
                </div>
                <span>Take Photo</span>
              </button>
            </>
          )}
        </motion.div>

        {/* Description Section - Always visible if image exists */}
        {image && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={styles.descriptionSection}
          >
            <div className={styles.textareaContainer}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description (optional)..."
                className={styles.textarea}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className={styles.submitButton}
            >
              <Send strokeWidth={2.5} />
              <span>Submit Item</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
