export interface CommunityStats {
    treesPlanted: number;
}

// Mock service to simulate fetching stats
export const statsService = {
    getCommunityStats: async (): Promise<CommunityStats> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Return mock data - 40 trees as requested
        return {
            treesPlanted: 400
        };
    }
};

// Deterministic Pseudo-Random Number Generator (Linear Congruential Generator)
// Used to ensure the forest looks the same for everyone based on a seed
export class SeededRandom {
    private seed: number;

    constructor(seed: number | string) {
        if (typeof seed === 'string') {
            // Simple hash function to convert string to number
            let h = 0x811c9dc5;
            for (let i = 0; i < seed.length; i++) {
                h ^= seed.charCodeAt(i);
                h = Math.imul(h, 0x01000193);
            }
            this.seed = h >>> 0;
        } else {
            this.seed = seed;
        }
    }

    // Returns a number between 0 (inclusive) and 1 (exclusive)
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    // Helper for range
    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }
}
