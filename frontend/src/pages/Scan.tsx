import { motion, AnimatePresence } from "motion/react";
import { Camera, ArrowLeft, Send, Loader2, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import styles from "./Scan.module.css";

interface ScanTrashProps {
  onBack: () => void;
}

interface LLMResponse {
  success: boolean;
  response: string;
}

export function ScanTrash({ onBack }: ScanTrashProps) {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedFileRef = useRef<File | null>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      capturedFileRef.current = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!capturedFileRef.current) {
      setError("No image file available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", capturedFileRef.current);
      
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const response = await fetch("http://localhost:3000/api/callLLM", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze image");
      }

      const data: LLMResponse = await response.json();
      setLlmResponse(data.response);
    } catch (err) {
      console.error("Error calling LLM API:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setDescription("");
    setLlmResponse(null);
    setError(null);
    capturedFileRef.current = null;
  };

  const handleRemoveImage = () => {
    setImage(null);
    capturedFileRef.current = null;
    setError(null);
  };

  const handleRetake = () => {
    setImage(null);
    capturedFileRef.current = null;
    setError(null);
    // Trigger the file input to open camera
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
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
        <AnimatePresence mode="wait">
          {llmResponse ? (
            // Response View
            <motion.div
              key="response"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className={styles.responseContainer}
            >
              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={styles.title}
              >
                Analysis Results
              </motion.h2>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={styles.responseContent}
              >
                <div className={styles.responseText}>
                  {llmResponse}
                </div>
              </motion.div>

              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className={styles.resetButton}
              >
                Scan Another Item
              </motion.button>
            </motion.div>
          ) : (
            // Scan View
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5 }}
              className={styles.scanContainer}
            >
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
                    <button onClick={handleRemoveImage} className={styles.trashButton}>
                      <Trash2 strokeWidth={2.5} />
                    </button>
                    <button onClick={handleRetake} className={styles.retakeButton}>
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
                      disabled={isLoading}
                    />
                  </div>

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
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 strokeWidth={2.5} className={styles.spinner} />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Send strokeWidth={2.5} />
                        <span>Submit Item</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
