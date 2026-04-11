import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ClipboardList, User } from 'lucide-react';

export function AssignTestDialog({ open, onOpenChange, studentId, studentName, onAssignComplete }) {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (open) {
            fetchExams();
        }
    }, [open]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teacher/exams');
            const data = response.data;

            if (!response.ok) {
                throw new Error('Failed to fetch exams');
            }

            const data = await response.json();
            setExams(data.exams || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedExam) {
            toast.error('Please select an exam');
            return;
        }

        setAssigning(true);
        try {
            const response = await api.post('/teacher/assignments', {
                examId: selectedExam,
                studentIds: [studentId]
            });

            const data = response.data;

            if (!response.ok) {
                throw new Error('Failed to assign exam');
            }

            const data = await response.json();
            toast.success(`Exam assigned to ${studentName} successfully!`);
            onAssignComplete?.();
            onOpenChange(false);
            setSelectedExam('');
        } catch (error) {
            console.error('Error assigning exam:', error);
            toast.error('Failed to assign exam');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Test</DialogTitle>
                    <DialogDescription>
                        Select an exam to assign to {studentName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{studentName}</span>
                    </div>

                    {/* Exam Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="exam">Select Exam</Label>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading exams...</p>
                        ) : exams.length === 0 ? (
                            <div className="text-center py-4">
                                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No exams available</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Create an exam first before assigning
                                </p>
                            </div>
                        ) : (
                            <Select value={selectedExam} onValueChange={setSelectedExam}>
                                <SelectTrigger id="exam">
                                    <SelectValue placeholder="Choose an exam" />
                                </SelectTrigger>
                                <SelectContent>
                                    {exams.map((exam) => (
                                        <SelectItem key={exam._id} value={exam._id}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{exam.title}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {exam.subject} • {exam.totalMarks} marks • {exam.duration} mins
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedExam && (
                        <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                            💡 The student will receive this exam and can attempt it from their dashboard
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={assigning}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedExam || assigning || exams.length === 0}
                    >
                        {assigning ? 'Assigning...' : 'Assign Exam'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
