import { motion, AnimatePresence } from "motion/react";
import { Camera, ArrowLeft, Type, Send, X, Recycle, AlertTriangle, Sprout, TreeDeciduous, Trash2, Cloud, TrendingUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import styles from "./Scan.module.css";
import { analyzeImage, incrementGlobalCO2Saved, incrementGlobalItemsScanned, incrementIndividualTrees, incrementUserItemsScanned } from "../services/api";

interface ScanTrashProps {
  username: string;
  userId: string;
  onBack: () => void;
  onNavigate: (page: "username" | "welcome" | "scan" | "community") => void;
}

type TrashCategory = "recyclable" | "compostable" | "hazardous";

interface ScanResult {
  category: TrashCategory;
  itemName: string;
  bin: string;
  co2Saved: string;
  recyclableRate: string;
  reasoning: string;
  notes: string;
}

export function ScanTrash({ userId, onBack, onNavigate }: ScanTrashProps) {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(0);
  const [scrollThumbTop, setScrollThumbTop] = useState(0);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setError("No image file selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeImage(imageFile, description);
      
      // Map classification to our category type
      let category: TrashCategory = "recyclable";
      const classification = response.response.classification.toLowerCase();
      
      if (classification.includes("compost")) {
        category = "compostable";
      } else if (classification.includes("hazard")) {
        category = "hazardous";
      } else if (classification.includes("recycle")) {
        category = "recyclable";
      }

      const result: ScanResult = {
        category,
        itemName: response.response.item_name,
        bin: response.response.bin,
        co2Saved: response.response.environmental_impact.co2_saved,
        recyclableRate: response.response.environmental_impact.recycling_rate,
        reasoning: response.response.reasoning,
        notes: response.response.miscellaneous,
      };

      setScanResult(result);

      // Update global stats
      try {
        // Parse CO2 saved value (e.g., "0.5 lbs" -> 0.5)
        const co2Value = parseFloat(result.co2Saved.replace(/[^\d.-]/g, ''));
        if (!isNaN(co2Value)) {
          await incrementGlobalCO2Saved(co2Value);
        }
        
        // Increment global items scanned
        await incrementGlobalItemsScanned(1);
        
        // Increment user items scanned
        await incrementUserItemsScanned(userId, 1);

        // Parse recycle rate (e.g., "70%" -> 0.70)
        const recycleRate = parseFloat(result.recyclableRate.replace(/[^\d.-]/g, '')) / 100;
        if (!isNaN(recycleRate)) {
          await incrementIndividualTrees(userId, recycleRate);
        }
      } catch (statsError) {
        console.error("Error updating stats:", statsError);
        // Don't show error to user, stats update is not critical
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsLoading(false);
    }
  };

  // DEV ONLY: Mock submit with fake data (commented out - uncomment the button below to use)
  // const handleDevSubmit = async () => {
  //   if (!image) {
  //     setError("No image selected");
  //     return;
  //   }
  //   setIsLoading(true);
  //   setError(null);
  //   // ... rest of implementation
  // };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setDescription("");
    setShowDescription(false);
    setScanResult(null);
    setError(null);
  };

  const updateScrollbar = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollableHeight = scrollHeight - clientHeight;
    
    // Only show scrollbar if content is scrollable
    if (scrollableHeight <= 0) {
      setScrollThumbHeight(0);
      return;
    }

    // Calculate thumb height (proportional to visible area)
    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 30);
    setScrollThumbHeight(thumbHeight);

    // Calculate thumb position
    const scrollPercentage = scrollTop / scrollableHeight;
    const maxThumbTop = clientHeight - thumbHeight;
    setScrollThumbTop(scrollPercentage * maxThumbTop);
  };

  const handleScroll = () => {
    updateScrollbar();
  };

  // Initialize scrollbar on scan result
  useEffect(() => {
    if (scanResult && scrollContainerRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(updateScrollbar, 100);
      // Also update on window resize
      window.addEventListener('resize', updateScrollbar);
      return () => window.removeEventListener('resize', updateScrollbar);
    }
  }, [scanResult]);

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
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setError(null);
                    }}
                    className={styles.deleteButton}
                  >
                    <Trash2 strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setError(null);
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
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

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.errorMessage}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              {image && (
                <>
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ""}`}
                  >
                    <Send strokeWidth={2.5} />
                    <span>{isLoading ? "Analyzing..." : "Submit Item"}</span>
                  </motion.button>

                  {/* DEV ONLY: Mock Submit Button */}
                  {/* <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDevSubmit}
                    disabled={isLoading}
                    className={`${styles.devButton} ${isLoading ? styles.submitButtonLoading : ""}`}
                  >
                    <span>🧪 Dev Test</span>
                  </motion.button> */}
                </>
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
                <h2 className={styles.successTitle}>
                  Item Scanned!
                </h2>
              </motion.div>

              {/* Item Name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className={styles.itemName}
              >
                {scanResult.itemName}
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
                    <div className={styles.statIconWrapper}>
                      <Cloud strokeWidth={2.5} />
                    </div>
                    <p className={styles.statLabel}>CO₂ Saved</p>
                  </div>
                  <p className={styles.statValue}>
                    {scanResult.co2Saved}
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
                    <div className={styles.statIconWrapper}>
                      <TrendingUp strokeWidth={2.5} />
                    </div>
                    <p className={styles.statLabel}>Recycle Rate</p>
                  </div>
                  <p className={styles.statValue}>
                    {scanResult.recyclableRate}
                  </p>
                </motion.div>
              </motion.div>

              {/* Combined Notes Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={styles.notesSection}
              >
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className={styles.notesScrollContainer}
                >
                  <div className={styles.notesBlock}>
                    <h3 className={styles.notesTitle}>Why?</h3>
                    <p className={styles.notesText}>
                      {scanResult.reasoning}
                    </p>
                  </div>
                  <div className={styles.notesBlock}>
                    <h3 className={styles.notesTitle}>Misc. Notes</h3>
                    <p className={styles.notesText}>
                      {scanResult.notes}
                    </p>
                  </div>
                </div>
                {/* Custom scrollbar indicator - always visible */}
                <div className={styles.customScrollbar}>
                  {scrollThumbHeight > 0 && (
                    <div 
                      className={styles.customScrollbarThumb}
                      style={{
                        height: `${scrollThumbHeight}px`,
                        transform: `translateY(${scrollThumbTop}px)`
                      }}
                    />
                  )}
                </div>
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
