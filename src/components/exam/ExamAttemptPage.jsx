import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle2, XCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

export function ExamAttemptPage() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        startExam();
    }, [assignmentId]);

    const startExam = async () => {
        try {
            const response = await api.post(`/student/assignments/${assignmentId}/start`);
            const data = response.data;
            setAssignment(data.assignment);
            setQuestions(data.assignment.questions || []);
        } catch (error) {
            console.error('Error starting exam:', error);
            toast.error('Failed to start exam');
            navigate('/dashboard/student');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            // Format answers for submission
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption: parseInt(selectedOption)
            }));

            const response = await api.post(`/student/assignments/${assignmentId}/submit`, { answers: formattedAnswers });
            const data = response.data;
            setResult(data.result);
            toast.success('Exam submitted successfully!');
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error('Failed to submit exam');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Loading exam...</p>
            </div>
        );
    }

    // Show results
    if (result) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                <Award className="h-16 w-16 text-primary mx-auto" />
                            </div>
                            <CardTitle className="text-3xl">Exam Completed!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Score Card */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-4xl font-bold text-primary">{result.score}</p>
                                        <p className="text-sm text-muted-foreground">out of {result.totalMarks}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-4xl font-bold text-green-600">{result.percentage}%</p>
                                        <p className="text-sm text-muted-foreground">Percentage</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <p className="text-4xl font-bold">{result.correctAnswers}</p>
                                        <p className="text-sm text-muted-foreground">out of {result.totalQuestions}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button onClick={() => navigate('/dashboard/student')}>
                                    Back to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show exam questions
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 bg-card border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">{assignment?.examTemplate?.title}</h1>
                        <p className="text-sm text-muted-foreground">{assignment?.examTemplate?.subject}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Exam'}
                        </Button>
                    </div>
                </div>
                <div className="px-4 pb-2">
                    <div className="max-w-4xl mx-auto">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {answeredCount} of {questions.length} questions answered
                        </p>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {questions.map((question, index) => (
                    <Card key={question._id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">
                                    Question {index + 1}
                                </CardTitle>
                                {answers[question._id] !== undefined && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                            </div>
                            <p className="text-base mt-2">{question.text}</p>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[question._id]?.toString()}
                                onValueChange={(value) => handleAnswerChange(question._id, parseInt(value))}
                            >
                                {question.options?.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent">
                                        <RadioGroupItem value={optionIndex.toString()} id={`${question._id}-${optionIndex}`} />
                                        <Label htmlFor={`${question._id}-${optionIndex}`} className="flex-1 cursor-pointer">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Submit Button */}
            <div className="sticky bottom-0 bg-card border-t p-4">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        size="lg"
                    >
                        {submitting ? 'Submitting...' : `Submit Exam (${answeredCount}/${questions.length})`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
