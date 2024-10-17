export function roundToOneDecimal(num: number): number {
    return Math.round(num * 10) / 10;
}

export function randomPositiveOrNegative(): number {
    return Math.random() < 0.5 ? 1 : -1;
}

export function getDegreeAngleFromDirection(x: number, y: number): number {
    const radianAngle = Math.atan2(y, x);
    const angle = (radianAngle / Math.PI) * 180;

    return angle < 0 ? angle + 360 : angle;
}

export function getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function getRandomHexStringColor(): string {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function shuffle<T>(array: T[]): T[] {
    const shuffledArray: T[] = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
}
