import { WizardProvider } from "./context";
import { WizardUI } from "./WizardUI";

export default function CalculatorPage() {
  return (
    <WizardProvider>
      <WizardUI />
    </WizardProvider>
  );
}
