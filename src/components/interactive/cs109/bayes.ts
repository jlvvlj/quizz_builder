export interface TestModel { positiveGivenDisease: number; positiveGivenHealthy: number; disease: number }

// The mammogram figures from the lesson; the prior is an example value to change.
export const MAMMOGRAM: TestModel = { positiveGivenDisease: 0.95, positiveGivenHealthy: 0.07, disease: 0.01 };

export function posterior({ positiveGivenDisease, positiveGivenHealthy, disease }: TestModel) {
    const positive = positiveGivenDisease * disease + positiveGivenHealthy * (1 - disease);
    return { positive, diseaseGivenPositive: positive ? (positiveGivenDisease * disease) / positive : 0 };
}
