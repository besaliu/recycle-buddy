import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Background } from "./components/Background";
import { UsernameEntry } from "./pages/UsernameEntry";
import { Welcome } from "./pages/Welcome";
import { ScanTrash } from "./pages/Scan";
import { CommunityTree } from "./pages/Community";
import "./App.css";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<"username" | "welcome" | "scan" | "community">("username");

  const handleUsernameSubmit = (name: string, id: string) => {
    setUsername(name);
    setUserId(id);
    setCurrentPage("welcome");
  };

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
        {currentPage === "username" && (
          <motion.div
            key="username"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <UsernameEntry onSubmit={handleUsernameSubmit} />
          </motion.div>
        )}

        {currentPage === "welcome" && username && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Welcome username={username} onNavigate={setCurrentPage} />
          </motion.div>
        )}

        {currentPage === "scan" && username && userId && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <ScanTrash username={username} userId={userId} onBack={() => setCurrentPage("welcome")} onNavigate={setCurrentPage} />
          </motion.div>
        )}

        {currentPage === "community" && userId && (
          <motion.div
            key="community"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <CommunityTree userId={userId} onBack={() => setCurrentPage("welcome")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
