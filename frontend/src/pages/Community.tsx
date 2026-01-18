import { motion } from "motion/react";
import { ArrowLeft, TreeDeciduous, Users, Award, Leaf } from "lucide-react";
import styles from "./Community.module.css";
import { Forest3D } from "../components/Forest3D";
import { useState, useEffect } from "react";
import {
  getGlobalItemsScanned,
  getGlobalUserCount,
  getIndividualTrees,
  getGlobalCO2Saved,
  getTopUsers,
} from "../services/api";
import type { TopUser } from "../services/api";

interface CommunityTreeProps {
  userId: string;
  onBack: () => void;
}

export function CommunityTree({ userId, onBack }: CommunityTreeProps) {
  const [stats, setStats] = useState({
    totalItems: 0,
    contributors: 0,
    treesPlanted: 0,
    co2Saved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [topContributors, setTopContributors] = useState<TopUser[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [items, users, individualTrees, co2, topUsers] = await Promise.all([
          getGlobalItemsScanned(),
          getGlobalUserCount(),
          getIndividualTrees(userId),
          getGlobalCO2Saved(),
          getTopUsers(),
        ]);

        // Extract whole number for individual tree count
        const treesContributed = Math.floor(individualTrees);
        
        // Extract decimal part for growth percentage (0-100)
        const decimalPart = individualTrees - treesContributed;
        const percentage = Math.round(decimalPart * 100);

        setStats({
          totalItems: items,
          contributors: users,
          treesPlanted: treesContributed, // Use individual tree count
          co2Saved: Number(co2.toFixed(2)), // Round to 2 decimal places
        });

        setGrowthPercentage(percentage);
        setTopContributors(topUsers);
      } catch (error) {
        console.error("Failed to fetch community stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

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

      {/* Content Container - No Scroll */}
      <div className={styles.contentContainer}>
        <div className={styles.contentInner}>
          {/* Title */}
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
            className={styles.title}
          >
            Community Forest
          </motion.h2>

          {/* 3D Trees */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            onAnimationComplete={() => {
              // Trigger resize to fix 3D canvas rendering issue
              window.dispatchEvent(new Event("resize"));
            }}
            className={styles.treeContainer}
          >
            <div className={styles.tree3DContainer}>
              <Forest3D count={stats.treesPlanted} />
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={styles.progressSection}
          >
            <div className={styles.progressBarWrapper}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 15 }}
                className={styles.percentageBadge}
                style={{ left: `${growthPercentage}%` }}
              >
                {growthPercentage}%
              </motion.div>
              <div className={styles.progressBar}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${growthPercentage}%` }}
                  transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                  className={styles.progressFill}
                />
              </div>
            </div>
            <p className={styles.progressText}>
              Next tree at 100%!
              <TreeDeciduous className={styles.progressIcon} strokeWidth={3} aria-hidden="true" />
            </p>
          </motion.div>

          {/* Scrollable Stats and Contributors Section */}
          <div className={styles.scrollableSection}>
            {/* Stats Cards - Compact 2x2 Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className={styles.statsGrid}
            >
              {/* Total Items Recycled */}
              <div className={`${styles.statCard} ${styles.items}`}>
                <div className={styles.statHeader}>
                  <Leaf strokeWidth={3} />
                  <span className={styles.statLabel}>Items</span>
                </div>
                <p className={styles.statValue}>{stats.totalItems}</p>
              </div>

              {/* Contributors */}
              <div className={`${styles.statCard} ${styles.people}`}>
                <div className={styles.statHeader}>
                  <Users strokeWidth={3} />
                  <span className={styles.statLabel}>People</span>
                </div>
                <p className={styles.statValue}>{stats.contributors}</p>
              </div>

              {/* Trees Planted */}
              <div className={`${styles.statCard} ${styles.trees}`}>
                <div className={styles.statHeader}>
                  <TreeDeciduous strokeWidth={3} />
                  <span className={styles.statLabel}>Trees Contributed</span>
                </div>
                <p className={styles.statValue}>{stats.treesPlanted}</p>
              </div>

              {/* CO2 Saved */}
              <div className={`${styles.statCard} ${styles.co2}`}>
                <div className={styles.statHeader}>
                  <span style={{ fontSize: '0.75rem' }}>☁️</span>
                  <span className={styles.statLabel}>CO₂</span>
                </div>
                <p className={`${styles.statValue} ${styles.small}`}>
                  {stats.co2Saved.toFixed(2)} lbs
                </p>
              </div>
            </motion.div>

            {/* Top Contributors - Compact */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className={styles.contributorsSection}
            >
              <div className={styles.contributorsHeader}>
                <Award strokeWidth={3} />
                <h3 className={styles.contributorsTitle}>Top Contributors</h3>
              </div>

              <div className={styles.contributorsList}>
                {topContributors.map((contributor, index) => (
                  <motion.div
                    key={contributor.UUID}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                    className={styles.contributorCard}
                  >
                    {/* Rank Badge */}
                    <div
                      className={`${styles.rankBadge} ${index === 0
                        ? styles.gold
                        : index === 1
                          ? styles.silver
                          : styles.bronze
                        }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Avatar */}
                    <div className={styles.avatar}>
                      {index === 0 ? "🌟" : index === 1 ? "🌱" : "♻️"}
                    </div>

                    {/* Info */}
                    <div className={styles.contributorInfo}>
                      <p className={styles.contributorName}>{contributor.username}</p>
                      <p className={styles.contributorItems}>
                        {Math.floor(contributor.individualTrees || 0)} trees
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
