import { useState, useEffect } from 'react';
import type { Workflow } from './models';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

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
    const [finished, setFinished] = useState(false);
    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

    useEffect(() => {
        fetchWorkflows().then(setWorkflows).catch(() => setWorkflows([]));
    }, []);

    useEffect(() => {
        setCurrentStep(0);
        setFinished(false);
    }, [selectedWorkflowId]);

    const handleFinish = () => {
        if (selectedWorkflow) {
            const updatedWorkflows = workflows.map(w => {
                if (w.id === selectedWorkflow.id) {
                    const steps = w.steps.map((step, idx) =>
                        idx === w.steps.length - 1 ? { ...step, completed: true, completedDate: new Date().toISOString() } : step
                    );
                    return { ...w, steps };
                }
                return w;
            });
            setWorkflows(updatedWorkflows);
            setCurrentStep(selectedWorkflow.steps.length);
        }
        setFinished(true);
    };

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h4" gutterBottom>HR Workflow Wizard</Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="workflow-select-label">Select Workflow</InputLabel>
                <Select
                    labelId="workflow-select-label"
                    value={selectedWorkflowId}
                    label="Select Workflow"
                    onChange={e => setSelectedWorkflowId(e.target.value)}
                >
                    <MenuItem value="">-- Choose --</MenuItem>
                    {workflows.map(w => (
                        <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {selectedWorkflow && (
                <Box>
                    <Typography variant="h5" gutterBottom>{selectedWorkflow.name}</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{selectedWorkflow.description}</Typography>
                    <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
                        {selectedWorkflow.steps.map((step) => (
                            <Step key={step.id}>
                                <StepLabel>{step.actor}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {!finished ? (
                        <>
                            <Box sx={{ p: 2, mb: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{selectedWorkflow.steps[currentStep].actor}:</Typography>
                                <Typography variant="body1">{selectedWorkflow.steps[currentStep].description}</Typography>
                                {currentStep === selectedWorkflow.steps.length - 1 && selectedWorkflow.steps[currentStep].completed && (
                                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                        Step marked as complete on {selectedWorkflow.steps[currentStep].completedDate ? new Date(selectedWorkflow.steps[currentStep].completedDate).toLocaleString() : ''}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                                    disabled={currentStep === 0}
                                >Previous</Button>
                                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                                    Step {currentStep + 1} of {selectedWorkflow.steps.length}
                                </Typography>
                                {currentStep === selectedWorkflow.steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleFinish}
                                    >Finish</Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={() => setCurrentStep(s => Math.min(selectedWorkflow.steps.length - 1, s + 1))}
                                    >Next</Button>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="h5" color="success.main" gutterBottom>
                                Workflow Complete!
                            </Typography>
                            <Typography variant="body1">
                                You have finished all steps for this workflow.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Completed on {new Date(selectedWorkflow.completedDate || new Date().toISOString()).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
