import { Slider } from '../InteractiveFigure';
import { TestModel } from './bayes';

export default function TestInputs({ model, onChange }: { model: TestModel; onChange: (model: TestModel) => void }) {
    const set = (key: keyof TestModel) => (value: number) => onChange({ ...model, [key]: value });
    return <div className="interactive-controls flex-col items-stretch">
        <Slider label="P(positive | disease)" value={model.positiveGivenDisease} min={0} max={1} step={0.01} format={v => v.toFixed(2)} onChange={set('positiveGivenDisease')} />
        <Slider label="P(positive | no disease)" value={model.positiveGivenHealthy} min={0} max={1} step={0.01} format={v => v.toFixed(2)} onChange={set('positiveGivenHealthy')} />
        <Slider label="P(disease)" value={model.disease} min={0} max={1} step={0.001} format={v => v.toFixed(3)} onChange={set('disease')} />
    </div>;
}
