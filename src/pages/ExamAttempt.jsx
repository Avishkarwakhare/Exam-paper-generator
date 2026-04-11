import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Home } from "lucide-react";

// CONFIGURATION
// TODO: Replace this with a valid ID from the backend (GET /api/templates)
const TEMPLATE_ID = "template-1";

export default function ExamAttempt() {
    const navigate = useNavigate();
    const [attemptData, setAttemptData] = useState(null); // { attemptId, questions }
    const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
    const [result, setResult] = useState(null); // { score, totalQuestions, ... }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // 1. Start Exam on Mount
    useEffect(() => {
        const startExam = async () => {
            try {
                setLoading(true);
                const response = await api.post('/attempts/start', {
                    templateId: TEMPLATE_ID,
                    studentId: "student_1"
                });

                const data = response.data;
                setAttemptData(data); // { attemptId, questions: [...] }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        startExam();
    }, []);

    // 2. Handle Answer Selection
    const handleSelectOption = (questionId, index) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: index
        }));
    };

    // 3. Submit Exam
    const handleSubmit = async () => {
        if (!attemptData) return;

        try {
            setSubmitting(true);
            const response = await api.post(`/attempts/${attemptData.attemptId}/submit`, { answers });
            const resultData = response.data;
            setResult(resultData); // { score, totalQuestions, correctAnswers, ... }
        } catch (err) {
            alert("Error submitting exam: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // RENDER: Loading / Error
    if (loading) return <div className="p-8 text-center">Starting your exam...</div>;
    if (error) return (
        <div className="p-8 text-center text-red-500">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <h2 className="text-xl font-bold">Error</h2>
            <p>{error}</p>
            <p className="text-sm mt-4 text-gray-500">Make sure the Backend is running and TEMPLATE_ID is correct.</p>
        </div>
    );

    // RENDER: Result View
    if (result) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Score Summary Card */}
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle2 className="h-6 w-6" />
                            Exam Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-bold text-green-700">
                            {result.percentage}
                        </div>
                        <p className="text-lg text-green-800">
                            You scored <strong>{result.score}</strong> out of <strong>{result.totalQuestions}</strong>
                        </p>
                    </CardContent>
                </Card>

                {/* Review Incorrect Answers Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Review Incorrect Answers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result.wrongQuestions && result.wrongQuestions.length > 0 ? (
                            <div className="space-y-6">
                                {result.wrongQuestions.map((q, index) => (
                                    <div key={q.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                                        <h3 className="font-medium text-lg mb-4">
                                            <span className="text-gray-500 mr-2">Question {index + 1}:</span>
                                            {q.text}
                                        </h3>
                                        <div className="space-y-2">
                                            {q.options.map((opt, optIndex) => {
                                                const isCorrect = optIndex === q.correctOption;
                                                const isSelected = optIndex === q.selectedOption;

                                                return (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg border-2 ${isCorrect
                                                            ? 'bg-green-50 border-green-400 text-green-900'
                                                            : isSelected
                                                                ? 'bg-red-50 border-red-400 text-red-900'
                                                                : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{opt}</span>
                                                            {isCorrect && (
                                                                <span className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded">
                                                                    Correct Answer
                                                                </span>
                                                            )}
                                                            {isSelected && !isCorrect && (
                                                                <span className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded">
                                                                    Your Answer
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                                <h3 className="text-xl font-bold text-green-800 mb-2">Perfect Score!</h3>
                                <p className="text-gray-600">You answered all questions correctly. Excellent work! 🎉</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-center">
                    <Button
                        onClick={() => navigate('/dashboard/student')}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // RENDER: Exam Interface
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold">Mid-Term Exam</h1>
                <p className="text-gray-500">Student ID: student_1</p>
            </header>

            <div className="space-y-6">
                {attemptData.questions.map((q, qIndex) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">
                                <span className="text-gray-500 mr-2">Q{qIndex + 1}.</span>
                                {q.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                onValueChange={(val) => handleSelectOption(q.id, parseInt(val))}
                                value={answers[q.id]?.toString()}
                                className="space-y-3"
                            >
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                        <RadioGroupItem value={optIndex.toString()} id={`${q.id}-${optIndex}`} />
                                        <Label htmlFor={`${q.id}-${optIndex}`} className="flex-1 cursor-pointer">
                                            {opt}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        disabled={submitting}
                        className="w-full sm:w-auto"
                    >
                        {submitting ? "Submitting..." : "Submit Exam"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
