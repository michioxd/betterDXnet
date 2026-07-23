interface RatingBreakpoint {
    achievement: number;
    coefficient: number;
}

const RATING_BREAKPOINTS: readonly RatingBreakpoint[] = [
    { achievement: 0, coefficient: 0 },
    { achievement: 10, coefficient: 1.6 },
    { achievement: 20, coefficient: 3.2 },
    { achievement: 30, coefficient: 4.8 },
    { achievement: 40, coefficient: 6.4 },
    { achievement: 50, coefficient: 8 },
    { achievement: 60, coefficient: 9.6 },
    { achievement: 70, coefficient: 11.2 },
    { achievement: 75, coefficient: 12.0 },
    { achievement: 79.9999, coefficient: 12.8 },
    { achievement: 80, coefficient: 13.6 },
    { achievement: 90, coefficient: 15.2 },
    { achievement: 94, coefficient: 16.8 },
    { achievement: 96.9999, coefficient: 17.6 },
    { achievement: 97, coefficient: 20 },
    { achievement: 98, coefficient: 20.3 },
    { achievement: 98.9999, coefficient: 20.6 },
    { achievement: 99, coefficient: 20.8 },
    { achievement: 99.5, coefficient: 21.1 },
    { achievement: 99.9999, coefficient: 21.4 },
    { achievement: 100, coefficient: 21.6 },
    { achievement: 100.4999, coefficient: 22.2 },
    { achievement: 100.5, coefficient: 22.4 },
] as const;

function getRatingCoefficient(achievement: number): number {
    for (let i = 0; i < RATING_BREAKPOINTS.length; i++) {
        if (i === RATING_BREAKPOINTS.length - 1 || achievement < RATING_BREAKPOINTS[i + 1].achievement) {
            const breakpoint = RATING_BREAKPOINTS[i];
            return breakpoint.coefficient;
        }
    }

    return 0;
}

export function calculateRating(achievement: number, constant: number, isAp: boolean): number {
    const coeff = getRatingCoefficient(achievement);

    return Math.floor((coeff * constant * Math.min(achievement, 100.5)) / 100) + (isAp ? 1 : 0);
}
