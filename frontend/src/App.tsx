import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Background } from "./components/Background";
import { Welcome } from "./pages/Welcome";
import { ScanTrash } from "./pages/Scan";
import { CommunityTree } from "./pages/Community";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"welcome" | "scan" | "community">("welcome");

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: 'linear-gradient(to bottom, #7dd3fc, #38bdf8, #7dd3fc)'
    }}>
      <Background />

      <AnimatePresence mode="wait">
        {currentPage === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Welcome onNavigate={setCurrentPage} />
          </motion.div>
        )}

        {currentPage === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <ScanTrash onBack={() => setCurrentPage("welcome")} />
          </motion.div>
        )}

        {currentPage === "community" && (
          <motion.div
            key="community"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <CommunityTree onBack={() => setCurrentPage("welcome")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
