import { motion } from "motion/react";
import styles from "./Background.module.css";
import sunSvg from "../assets/sun.svg";

export function Background() {
  return (
    <>
      {/* Sky Background */}
      <div className={styles.skyBackground} />
      
      {/* Sun */}
      <motion.div
        className={styles.sun}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <img src={sunSvg} alt="Sun" className={styles.sunImage} />
      </motion.div>

      {/* Clouds */}
      <motion.div
        className={`${styles.cloud} ${styles.cloud1}`}
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud />
      </motion.div>

      <motion.div
        className={`${styles.cloud} ${styles.cloud2}`}
        animate={{ x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud size="small" />
      </motion.div>

      <motion.div
        className={`${styles.cloud} ${styles.cloud3}`}
        animate={{ x: [0, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud size="medium" />
      </motion.div>

      {/* Grass/Ground */}
      <div className={styles.ground}>
        {/* Grass layers for depth */}
        <div className={styles.groundLayers}>
          {/* Back grass layer */}
          <div className={styles.grassBack} />
          {/* Middle grass layer */}
          <div className={styles.grassMiddle} />
          {/* Front grass layer */}
          <div className={styles.grassFront} />
        </div>

        {/* Flowers */}
        <div className={`${styles.flower} ${styles.flower1}`}>
          <Flower color="pink" delay={0} />
        </div>
        <div className={`${styles.flower} ${styles.flower2}`}>
          <Flower color="yellow" delay={0.8} />
        </div>
        <div className={`${styles.flower} ${styles.flower3}`}>
          <Flower color="purple" delay={1.2} />
        </div>
        <div className={`${styles.flower} ${styles.flower4}`}>
          <Flower color="pink" delay={0.4} />
        </div>
        <div className={`${styles.flower} ${styles.flower5}`}>
          <Flower color="yellow" delay={1.6} />
        </div>
        <div className={`${styles.flower} ${styles.flower6}`}>
          <Flower color="purple" delay={2} />
        </div>
      </div>
    </>
  );
}

// Cloud Component
function Cloud({ size = "large" }: { size?: "small" | "medium" | "large" }) {
  const scale = size === "small" ? 0.6 : size === "medium" ? 0.8 : 1;
  
  return (
    <div className={styles.cloudWrapper} style={{ transform: `scale(${scale})` }}>
      <div className={styles.cloudBubbles}>
        <div className={styles.cloudBubble1} />
        <div className={styles.cloudBubble2} />
        <div className={styles.cloudBubble3} />
        <div className={styles.cloudBubble4} />
      </div>
    </div>
  );
}

// Flower Component
function Flower({ color, delay }: { color: "pink" | "yellow" | "purple"; delay: number }) {
  const petalClass = color === "pink" ? styles.petalPink : color === "yellow" ? styles.petalYellow : styles.petalPurple;
  const centerClass = color === "pink" ? styles.centerYellow : color === "yellow" ? styles.centerOrange : styles.centerYellowLight;

  return (
    <motion.div
      className={styles.flowerContainer}
      animate={{
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {/* Stem */}
      <div className={styles.flowerStem} />
      
      {/* Petals */}
      <div className={styles.flowerPetals}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`${styles.flowerPetal} ${petalClass}`}
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 72}deg) translateY(-5px)`,
            }}
          />
        ))}
        
        {/* Center */}
        <div className={`${styles.flowerCenter} ${centerClass}`} />
      </div>
    </motion.div>
  );
}
