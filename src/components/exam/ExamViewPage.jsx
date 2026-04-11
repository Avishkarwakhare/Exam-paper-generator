import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer, Calendar, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export function ExamViewPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExamDetails();
    }, [examId]);

    const fetchExamDetails = async () => {
        try {
            // Fetch exam details
            const examResponse = await api.get(`/teacher/exams/${examId}`);
            const examData = examResponse.data;

            if (!examResponse.ok) {
                throw new Error('Failed to fetch exam details');
            }

            const examData = await examResponse.json();
            setExam(examData.exam);

            // Fetch all questions for this teacher
            const questionsResponse = await api.get('/teacher/questions');

            if (questionsResponse.status === 200) {
                const questionsData = questionsResponse.data;
            } // Close if

                // Filter questions that match this exam's criteria
                // Get questions that were created around the same time as the exam
                // and match the subject
                const examCreatedAt = new Date(examData.exam.createdAt);
                const timeWindow = 5 * 60 * 1000; // 5 minutes before/after

                const filteredQuestions = questionsData.questions.filter(q => {
                    const questionCreatedAt = new Date(q.createdAt);
                    const timeDiff = Math.abs(questionCreatedAt - examCreatedAt);

                    return (
                        q.subject === examData.exam.subject &&
                        q.isActive &&
                        timeDiff <= timeWindow
                    );
                });

                // Sort by creation time to maintain order
                filteredQuestions.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)
                );

                setQuestions(filteredQuestions);
            }
        } catch (err) {
            console.error('Error fetching exam:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Future: Implement PDF download
        alert('PDF download will be implemented soon!');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="container mx-auto p-6 max-w-5xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-destructive mb-4">Error: {error || 'Exam not found'}</p>
                        <Button asChild>
                            <Link to="/dashboard/exams">Back to My Exams</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Button variant="outline" asChild>
                    <Link to="/dashboard/exams">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Exams
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Exam Header */}
            <Card className="print:shadow-none print:border-none">
                <CardHeader className="text-center border-b">
                    <CardTitle className="text-3xl">{exam.title}</CardTitle>
                    {exam.description && (
                        <p className="text-muted-foreground mt-2">{exam.description}</p>
                    )}
                    <div className="flex justify-center gap-6 text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {format(new Date(exam.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{exam.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Total: {exam.totalMarks} marks</span>
                        </div>
                    </div>
                </CardHeader>

                {/* Exam Instructions */}
                <CardContent className="pt-6">
                    <div className="mb-6 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">Instructions:</h3>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Read each question carefully before answering</li>
                            <li>Total duration: {exam.duration} minutes</li>
                            <li>Total marks: {exam.totalMarks}</li>
                            <li>All questions are multiple choice</li>
                        </ul>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Questions ({questions.length})</h3>

                        {questions.length === 0 ? (
                            <p className="text-muted-foreground">No questions found for this exam.</p>
                        ) : (
                            questions.map((question, index) => (
                                <Card key={question._id} className="border-l-4 border-l-primary">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <span className="text-lg font-semibold text-muted-foreground">
                                                Q{index + 1}.
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-lg mb-4">{question.text}</p>

                                                {question.options && question.options.length > 0 && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-3 rounded-lg border ${question.correctOption === optIndex
                                                                    ? 'bg-green-50 border-green-200 print:bg-white'
                                                                    : 'bg-gray-50 border-gray-200'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {String.fromCharCode(65 + optIndex)}.
                                                                    </span>
                                                                    <span>{option}</span>
                                                                    {question.correctOption === optIndex && (
                                                                        <span className="ml-auto text-xs font-semibold text-green-700 print:hidden">
                                                                            ✓ Correct
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="font-medium">{question.marks} mark{question.marks !== 1 ? 's' : ''}</span>
                                                    <span className="capitalize">{question.difficulty}</span>
                                                    {question.topic && <span>{question.topic}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Answer Key Section (Print Only) */}
            <div className="hidden print:block mt-8 page-break-before">
                <Card>
                    <CardHeader>
                        <CardTitle>Answer Key</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            {questions.map((question, index) => (
                                <div key={question._id} className="text-sm">
                                    <span className="font-semibold">Q{index + 1}:</span>{' '}
                                    <span>Option {String.fromCharCode(65 + question.correctOption)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
