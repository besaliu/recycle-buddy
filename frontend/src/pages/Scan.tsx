import { motion, AnimatePresence } from "motion/react";
import { Camera, ArrowLeft, Type, Send, X, Recycle, AlertTriangle, Sprout, TreeDeciduous } from "lucide-react";
import { useState, useRef } from "react";
import styles from "./Scan.module.css";

interface ScanTrashProps {
  username: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

type TrashCategory = "recyclable" | "compostable" | "hazardous";

interface ScanResult {
  category: TrashCategory;
  co2Saved: number;
  recyclableRate: number;
  notes: string;
}

export function ScanTrash({ username, onBack, onNavigate }: ScanTrashProps) {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
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
    // Mock classification logic - randomly assign category
    const categories: TrashCategory[] = ["recyclable", "compostable", "hazardous"];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Generate mock stats based on category
    const result: ScanResult = {
      category,
      co2Saved: category === "recyclable" ? Math.floor(Math.random() * 30 + 10) : 
                category === "compostable" ? Math.floor(Math.random() * 20 + 5) :
                Math.floor(Math.random() * 5),
      recyclableRate: category === "recyclable" ? Math.floor(Math.random() * 30 + 70) :
                      category === "compostable" ? Math.floor(Math.random() * 20 + 50) :
                      Math.floor(Math.random() * 20 + 10),
      notes: category === "recyclable" 
        ? "Great job! This item can be recycled. Make sure it's clean and dry before placing it in the recycling bin."
        : category === "compostable"
        ? "Perfect for composting! This organic material will help enrich the soil and reduce landfill waste."
        : "Caution! This item requires special disposal. Please take it to a hazardous waste facility."
    };

    setScanResult(result);
  };

  const handleReset = () => {
    setImage(null);
    setDescription("");
    setShowDescription(false);
    setScanResult(null);
  };

  // Category icon mapping
  const getCategoryIcon = (category: TrashCategory) => {
    switch (category) {
      case "recyclable":
        return Recycle;
      case "compostable":
        return Sprout;
      case "hazardous":
        return AlertTriangle;
    }
  };

  // Category emoji mapping
  const getCategoryEmoji = (category: TrashCategory) => {
    switch (category) {
      case "recyclable":
        return "♻️";
      case "compostable":
        return "🌱";
      case "hazardous":
        return "⚠️";
    }
  };

  // Category label mapping
  const getCategoryLabel = (category: TrashCategory) => {
    switch (category) {
      case "recyclable":
        return "Recyclable";
      case "compostable":
        return "Compostable";
      case "hazardous":
        return "Hazardous";
    }
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
        <button
          onClick={scanResult ? handleReset : onBack}
          className={styles.backButton}
        >
          <div className={styles.backIconWrapper}>
            {scanResult ? <X strokeWidth={3} /> : <ArrowLeft strokeWidth={3} />}
          </div>
          <span>{scanResult ? "New Scan" : "Back"}</span>
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {!scanResult ? (
          /* Scanning Interface */
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.scanInterface}
          >
            {/* Title */}
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className={styles.scanTitle}
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
                <div className={styles.imagePreviewContainer}>
                  <div className={styles.imagePreview}>
                    <img src={image} alt="Captured item" />
                  </div>
                  <button
                    onClick={() => setImage(null)}
                    className={styles.retakeButton}
                  >
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
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.cameraButton}
                  >
                    <div className={styles.cameraIconWrapper}>
                      <Camera strokeWidth={2.5} />
                    </div>
                    <span>Take Photo</span>
                  </button>
                </>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className={styles.actionButtons}
            >
              {/* Add Description Button */}
              {!showDescription && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDescription(true)}
                  className={styles.descriptionButton}
                >
                  <Type strokeWidth={2.5} />
                  <span>Add Description (Optional)</span>
                </motion.button>
              )}

              {/* Description Textarea */}
              {showDescription && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={styles.textareaWrapper}
                >
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the item... (e.g., plastic bottle, cardboard box)"
                    className={styles.textarea}
                  />
                </motion.div>
              )}

              {/* Submit Button */}
              {image && (
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
              )}
            </motion.div>
          </motion.div>
        ) : (
          /* Results Interface */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className={styles.resultsInterface}
          >
            <div className={styles.resultsContent}>
              {/* Success Header */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={styles.successHeader}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className={styles.categoryEmoji}
                >
                  {getCategoryEmoji(scanResult.category)}
                </motion.div>
                <h2 className={styles.successTitle}>
                  Item Scanned! 🎉
                </h2>
                <p className={styles.successSubtitle}>
                  Great work, {username}!
                </p>
              </motion.div>

              {/* Category Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className={`${styles.categoryBadge} ${styles[`category${scanResult.category.charAt(0).toUpperCase() + scanResult.category.slice(1)}`]}`}
              >
                <div className={styles.categoryBadgeContent}>
                  <div className={styles.categoryIconWrapper}>
                    {(() => {
                      const Icon = getCategoryIcon(scanResult.category);
                      return <Icon strokeWidth={2.5} />;
                    })()}
                  </div>
                  <div className={styles.categoryInfo}>
                    <p className={styles.categoryLabel}>Category</p>
                    <p className={styles.categoryName}>
                      {getCategoryLabel(scanResult.category)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={styles.statsGrid}
              >
                {/* CO2 Saved */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                  className={styles.statCard}
                >
                  <div className={styles.statHeader}>
                    <span className={styles.statEmoji}>☁️</span>
                    <p className={styles.statLabel}>CO₂ Saved</p>
                  </div>
                  <p className={styles.statValue}>
                    {scanResult.co2Saved}%
                  </p>
                </motion.div>

                {/* Recyclable Rate */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
                  className={styles.statCardGreen}
                >
                  <div className={styles.statHeader}>
                    <span className={styles.statEmoji}>📊</span>
                    <p className={styles.statLabel}>Recycle Rate</p>
                  </div>
                  <p className={styles.statValue}>
                    {scanResult.recyclableRate}%
                  </p>
                </motion.div>
              </motion.div>

              {/* Notes Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={styles.notesSection}
              >
                <div className={styles.notesHeader}>
                  <h3 className={styles.notesTitle}>Misc. Notes</h3>
                </div>
                <p className={styles.notesText}>
                  {scanResult.notes}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div className={styles.resultActions}>
                {/* Scan Another Item Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className={styles.scanAnotherButton}
                >
                  <Camera strokeWidth={2.5} />
                  <span>Scan Another</span>
                </motion.button>

                {/* View Contribution Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate("community")}
                  className={styles.viewContributionButton}
                >
                  <TreeDeciduous strokeWidth={2.5} />
                  <span>View Contribution</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
