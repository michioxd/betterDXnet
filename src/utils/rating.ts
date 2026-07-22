interface RatingBreakpoint {
    achievement: number;
    coefficient: number;
}

const RATING_BREAKPOINTS: readonly RatingBreakpoint[] = [
    { achievement: 100.5, coefficient: 0.224 },
    { achievement: 100.4999, coefficient: 0.222 },
    { achievement: 100.0, coefficient: 0.216 },
    { achievement: 99.9999, coefficient: 0.214 },
    { achievement: 99.5, coefficient: 0.211 },
    { achievement: 99.0, coefficient: 0.208 },
    { achievement: 98.9999, coefficient: 0.206 },
    { achievement: 98.0, coefficient: 0.203 },
    { achievement: 97.0, coefficient: 0.2 },
    { achievement: 96.9999, coefficient: 0.176 },
    { achievement: 94.0, coefficient: 0.168 },
    { achievement: 90.0, coefficient: 0.152 },
    { achievement: 80.0, coefficient: 0.136 },
    { achievement: 79.9999, coefficient: 0.128 },
    { achievement: 75.0, coefficient: 0.12 },
    { achievement: 70.0, coefficient: 0.112 },
    { achievement: 60.0, coefficient: 0.096 },
    { achievement: 50.0, coefficient: 0.08 },
    { achievement: 40.0, coefficient: 0.064 },
    { achievement: 30.0, coefficient: 0.048 },
    { achievement: 20.0, coefficient: 0.032 },
    { achievement: 10.0, coefficient: 0.016 },
    { achievement: 0.0, coefficient: 0.0 },
] as const;

function getRatingCoefficient(achievement: number): number {
    const acc = Math.max(0, Math.min(achievement, 100.5));

    for (let i = 0; i < RATING_BREAKPOINTS.length - 1; i++) {
        const upper = RATING_BREAKPOINTS[i];
        const lower = RATING_BREAKPOINTS[i + 1];

        if (acc >= lower.achievement) {
            const t = (acc - lower.achievement) / (upper.achievement - lower.achievement);

            return lower.coefficient + t * (upper.coefficient - lower.coefficient);
        }
    }

    return 0;
}

export function calculateRating(achievement: number, constant: number): number {
    const coeff = getRatingCoefficient(achievement);

    return Math.floor(constant * Math.min(Math.max(achievement, 0), 100.5) * coeff);
}
