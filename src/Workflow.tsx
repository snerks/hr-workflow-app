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
import MobileStepper from '@mui/material/MobileStepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import workflowDefinitions from './workflows.json';

// Case model
interface CaseStep {
    id: string;
    completed: boolean;
    completedDate?: string;
}
interface Case {
    id: string;
    workflowId: string;
    startedDate: string;
    steps: CaseStep[];
    finished: boolean;
    finishedDate?: string;
}
interface AuditEntry {
    stepId: string;
    stepIndex: number;
    timestamp: string;
}

function createCaseFromWorkflow(workflow: Workflow): Case {
    return {
        id: `${workflow.id}-${Date.now()}`,
        workflowId: workflow.id,
        startedDate: new Date().toISOString(),
        steps: workflow.steps.map(step => ({ id: step.id, completed: false })),
        finished: false,
    };
}

export default function WorkflowWizard() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
    const [cases, setCases] = useState<Case[]>([]);
    const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [finished, setFinished] = useState(false);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [darkMode, setDarkMode] = useState(false);
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
        components: {
            MuiTypography: {
                styleOverrides: {
                    h4: darkMode ? { color: '#fff' } : {},
                },
            },
        },
    });
    const isMobile = useMediaQuery('(max-width:600px)');
    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);
    const activeCase = cases.find(c => c.id === activeCaseId);

    useEffect(() => {
        setWorkflows(workflowDefinitions as Workflow[]);
    }, []);

    useEffect(() => {
        setCurrentStep(0);
        setFinished(false);
        setActiveCaseId(null);
        setAuditLog([]);
    }, [selectedWorkflowId]);

    const handleCreateCase = () => {
        if (selectedWorkflow) {
            const newCase = createCaseFromWorkflow(selectedWorkflow);
            setCases(prev => [...prev, newCase]);
            setActiveCaseId(newCase.id);
            setCurrentStep(0);
            setFinished(false);
            setAuditLog([
                {
                    stepId: selectedWorkflow.steps[0].id,
                    stepIndex: 0,
                    timestamp: new Date().toISOString(),
                },
            ]);
        }
    };

    const handleStepChange = (nextStep: number) => {
        if (!activeCase || !selectedWorkflow) return;
        setCases(prevCases => prevCases.map(c => {
            if (c.id !== activeCase.id) return c;
            const steps = c.steps.map((s, idx) => {
                if (idx === currentStep && nextStep > currentStep) {
                    // Mark as complete if moving forward
                    return { ...s, completed: true, completedDate: s.completed ? s.completedDate : new Date().toISOString() };
                } else if (idx === currentStep && nextStep < currentStep) {
                    // Unmark as complete if moving back
                    return { ...s, completed: false, completedDate: undefined };
                }
                return s;
            });
            return { ...c, steps };
        }));
        setAuditLog(prev => [
            ...prev,
            {
                stepId: selectedWorkflow.steps[nextStep].id,
                stepIndex: nextStep,
                timestamp: new Date().toISOString(),
            },
        ]);
        setCurrentStep(nextStep);
    };

    const handleFinish = () => {
        if (!activeCase) return;
        setCases(prevCases => prevCases.map(c => {
            if (c.id !== activeCase.id) return c;
            const steps = c.steps.map((s, idx) =>
                idx === c.steps.length - 1 ? { ...s, completed: true, completedDate: s.completedDate || new Date().toISOString() } : s
            );
            return { ...c, steps, finished: true, finishedDate: new Date().toISOString() };
        }));
        setAuditLog(prev => [
            ...prev,
            {
                stepId: 'WORKFLOW_FINISHED',
                stepIndex: currentStep,
                timestamp: new Date().toISOString(),
            },
        ]);
        setFinished(true);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h4" gutterBottom sx={darkMode ? { color: '#fff' } : {}}>
                        HR Workflow
                    </Typography>
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={() => setDarkMode(v => !v)} color="primary" />}
                        label={darkMode ? 'Dark' : 'Light'}
                        labelPlacement="start"
                        sx={{ ml: 2, ...(darkMode ? { color: '#fff' } : {}) }}
                    />
                </Box>
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
                {selectedWorkflow && !activeCase && (
                    <Button variant="contained" color="primary" onClick={handleCreateCase} sx={{ mb: 3 }}>
                        Start New Case
                    </Button>
                )}
                {selectedWorkflow && activeCase && (
                    <Box>
                        <Typography variant="caption" gutterBottom sx={darkMode ? { color: '#fff' } : {}}>Case Id: {activeCase.id}</Typography>
                        <Typography variant="h5" gutterBottom sx={darkMode ? { color: '#fff' } : {}}>{selectedWorkflow.name}</Typography>
                        <Typography variant="body1" sx={{ mb: 2, ...(darkMode ? { color: '#fff' } : {}) }}>{selectedWorkflow.description}</Typography>
                        {isMobile ? (
                            <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
                                <MobileStepper
                                    variant="progress"
                                    steps={selectedWorkflow.steps.length}
                                    position="static"
                                    activeStep={currentStep}
                                    sx={{
                                        flexGrow: 1,
                                        mb: 3,
                                        bgcolor: darkMode ? 'grey.900' : 'grey.100'
                                    }}
                                    LinearProgressProps={{
                                        sx: {
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: activeCase.steps[currentStep]?.completed ? 'success.main' : 'primary.main'
                                            }
                                        }
                                    }}
                                    backButton={
                                        <Button
                                            size="small"
                                            onClick={() => handleStepChange(currentStep - 1)}
                                            disabled={currentStep === 0}
                                            sx={darkMode ? { color: '#fff' } : {}}
                                        >
                                            <KeyboardArrowLeft />
                                            Back
                                        </Button>
                                    }
                                    nextButton={
                                        <Button
                                            size="small"
                                            onClick={() => currentStep === selectedWorkflow.steps.length - 1
                                                ? handleFinish()
                                                : handleStepChange(currentStep + 1)
                                            }
                                            sx={darkMode ? { color: '#fff' } : {}}
                                        >
                                            {currentStep === selectedWorkflow.steps.length - 1 ? 'Finish' : 'Next'}
                                            <KeyboardArrowRight />
                                        </Button>
                                    }
                                />
                                <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, ...(darkMode ? { color: '#fff' } : {}) }}>
                                    {selectedWorkflow.steps[currentStep].actor}: Step {currentStep + 1} of {selectedWorkflow.steps.length}
                                </Typography>
                            </Box>
                        ) : (
                            <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
                                {selectedWorkflow.steps.map((step, idx) => (
                                    <Step key={step.id} completed={!!activeCase.steps[idx]?.completed}>
                                        <StepLabel>{step.actor}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        )}

                        {!finished ? (
                            <>
                                <Box sx={{ p: 2, mb: 2, bgcolor: darkMode ? 'grey.900' : 'grey.100', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, ...(darkMode ? { color: '#fff' } : {}) }}>
                                        {selectedWorkflow.steps[currentStep].actor}:
                                    </Typography>
                                    <Typography variant="body1" sx={darkMode ? { color: '#fff' } : {}}>
                                        {selectedWorkflow.steps[currentStep].description}
                                    </Typography>
                                    {activeCase.steps[currentStep]?.completed && (
                                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                            Step marked as complete{activeCase.steps[currentStep].completedDate
                                                ? ` on ${new Date(activeCase.steps[currentStep].completedDate!).toLocaleString()}`
                                                : ''}
                                        </Typography>
                                    )}
                                </Box>
                                {!isMobile && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleStepChange(currentStep - 1)}
                                            disabled={currentStep === 0}
                                            startIcon={<KeyboardArrowLeft />}
                                        >
                                            Previous
                                        </Button>
                                        <Typography variant="body2" sx={{ ...(darkMode ? { color: '#fff' } : {}) }}>
                                            Step {currentStep + 1} of {selectedWorkflow.steps.length}
                                        </Typography>
                                        {currentStep === selectedWorkflow.steps.length - 1 ? (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={handleFinish}
                                                endIcon={<KeyboardArrowRight />}
                                            >
                                                Finish
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                onClick={() => handleStepChange(currentStep + 1)}
                                                endIcon={<KeyboardArrowRight />}
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Typography variant="h5" color="success.main" gutterBottom>
                                    Case Complete!
                                </Typography>
                                <Typography variant="body1" sx={{ ...(darkMode ? { color: '#fff' } : {}) }}>
                                    You have finished all steps for this case.
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, ...(darkMode ? { color: '#fff' } : {}) }}>
                                    Completed on {activeCase.finishedDate ? new Date(activeCase.finishedDate).toLocaleString() : ''}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="h6" sx={{ mt: 4, mb: 1, ...(darkMode ? { color: '#fff' } : {}) }}>Audit Log</Typography>
                        <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2, mb: 2, maxHeight: 200, overflow: 'auto' }}>
                            {auditLog.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No steps visited yet.</Typography>
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {auditLog.map((entry, idx) => (
                                        <li key={idx}>
                                            <Typography variant="body2">
                                                {entry.stepId === 'WORKFLOW_FINISHED'
                                                    ? `Workflow finished at ${new Date(entry.timestamp).toLocaleString()}`
                                                    : `Visited step ${entry.stepIndex + 1} (${selectedWorkflow.steps[entry.stepIndex].actor}: ${selectedWorkflow.steps[entry.stepIndex].description.slice(0, 40)}...) at ${new Date(entry.timestamp).toLocaleString()}`}
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}
