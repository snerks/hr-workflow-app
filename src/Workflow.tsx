import { useState, useEffect } from 'react';
import './Workflow.css';
import type { Workflow } from './models';

// Helper to load workflows from JSON
async function fetchWorkflows(): Promise<Workflow[]> {
    const resp = await fetch('/src/workflows.json');
    if (!resp.ok) throw new Error('Failed to load workflows');
    return resp.json();
}

export default function WorkflowWizard() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
    const [currentStep, setCurrentStep] = useState(0);
    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

    useEffect(() => {
        fetchWorkflows().then(setWorkflows).catch(() => setWorkflows([]));
    }, []);

    useEffect(() => {
        setCurrentStep(0);
    }, [selectedWorkflowId]);

    return (
        <div className="workflow-container">
            <h2>HR Workflow Wizard</h2>
            <label>
                Select Workflow:{' '}
                <select
                    value={selectedWorkflowId}
                    onChange={e => setSelectedWorkflowId(e.target.value)}
                >
                    <option value="">-- Choose --</option>
                    {workflows.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </select>
            </label>
            {selectedWorkflow && (
                <div className="wizard">
                    <h3>{selectedWorkflow.name}</h3>
                    <p>{selectedWorkflow.description}</p>
                    <div className="wizard-step">
                        <div className={`workflow-step workflow-step-${selectedWorkflow.steps[currentStep].actor.toLowerCase()}`}>
                            <strong>{selectedWorkflow.steps[currentStep].actor}:</strong> {selectedWorkflow.steps[currentStep].description}
                        </div>
                        <div className="wizard-controls">
                            <button
                                onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                                disabled={currentStep === 0}
                            >Previous</button>
                            <span> Step {currentStep + 1} of {selectedWorkflow.steps.length} </span>
                            <button
                                onClick={() => setCurrentStep(s => Math.min(selectedWorkflow.steps.length - 1, s + 1))}
                                disabled={currentStep === selectedWorkflow.steps.length - 1}
                            >Next</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
