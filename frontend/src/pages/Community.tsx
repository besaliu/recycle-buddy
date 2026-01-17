import { motion } from "motion/react";
import { ArrowLeft, TreeDeciduous, Users, Award, Leaf } from "lucide-react";
import styles from "./Community.module.css";

interface CommunityTreeProps {
  onBack: () => void;
}

export function CommunityTree({ onBack }: CommunityTreeProps) {
  // Mock data for community stats
  const stats = {
    totalItems: 1247,
    contributors: 89,
    treesPlanted: 12,
    co2Saved: 340,
  };

  // Tree growth percentage (0-100)
  const growthPercentage = 67; // This would be calculated based on community goals

  const topContributors = [
    { name: "EcoWarrior", items: 156, avatar: "🌟" },
    { name: "GreenThumb", items: 143, avatar: "🌱" },
    { name: "RecyclePro", items: 128, avatar: "♻️" },
  ];

  // Calculate tree scale based on percentage (min 0.4, max 1.0)
  const treeScale = 0.4 + (growthPercentage / 100) * 0.6;

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
            Community Tree
          </motion.h2>

          {/* Animated Tree with Growth */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            className={styles.treeContainer}
          >
            {/* Tree Container */}
            <div className={styles.treeWrapper}>
              {/* Tree Crown - scales with growth */}
              <motion.div
                className={styles.treeCrown}
                animate={{
                  scale: [treeScale, treeScale * 1.05, treeScale],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className={styles.crownWrapper}>
                  {/* Leaves - layered circles for cartoon look */}
                  <div className={styles.leaf1} />
                  <div className={styles.leaf2} />
                  <div className={styles.leaf3} />
                  <div className={styles.leaf4} />
                  
                  {/* Floating leaves */}
                  <motion.div
                    className={styles.floatingLeaf1}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    🍃
                  </motion.div>
                  <motion.div
                    className={styles.floatingLeaf2}
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    🍃
                  </motion.div>
                </div>
              </motion.div>

              {/* Tree Trunk - fixed size */}
              <div className={styles.trunk} />
              
              {/* Growth Percentage Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 20 }}
                className={styles.growthBadge}
              >
                <span>{growthPercentage}%</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={styles.progressSection}
          >
            <div className={styles.progressBar}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${growthPercentage}%` }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                className={styles.progressFill}
              />
            </div>
            <p className={styles.progressText}>
              Next tree at 100%! 🌳
            </p>
          </motion.div>

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
                <span className={styles.statLabel}>Trees</span>
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
                {stats.co2Saved}kg
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
                  key={contributor.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  className={styles.contributorCard}
                >
                  {/* Rank Badge */}
                  <div
                    className={`${styles.rankBadge} ${
                      index === 0
                        ? styles.gold
                        : index === 1
                        ? styles.silver
                        : styles.bronze
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Avatar */}
                  <div className={styles.avatar}>{contributor.avatar}</div>

                  {/* Info */}
                  <div className={styles.contributorInfo}>
                    <p className={styles.contributorName}>{contributor.name}</p>
                    <p className={styles.contributorItems}>{contributor.items} items</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
