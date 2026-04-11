import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuestionBank } from '@/context/QuestionBankContext';

const SUBJECTS = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Biology",
    "English",
    "History",
    "Geography",
    "Economics",
    "Commerce"
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export function AIQuestionGenerator() {
    const { addQuestion } = useQuestionBank();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        difficulty: 'Medium',
        count: 5
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        // Validation
        if (!formData.subject || !formData.topic) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.count < 1 || formData.count > 20) {
            toast.error('Question count must be between 1 and 20');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/ai/generate-questions', formData);
            const data = response.data;

            // Add each question to the question bank
            data.questions.forEach(question => {
                addQuestion({
                    ...question,
                    category: formData.subject
                });
            });

            toast.success(`Successfully generated ${data.count} questions!`, {
                description: 'Questions have been added to your question bank for review.'
            });

            // Reset form and close dialog
            setFormData({
                subject: '',
                topic: '',
                difficulty: 'Medium',
                count: 5
            });
            setOpen(false);

        } catch (error) {
            console.error('Error generating questions:', error);
            toast.error('Failed to generate questions', {
                description: error.message || 'Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Question Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate MCQ questions using AI. Powered by Mistral 7B.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">
                            Subject <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.subject}
                            onValueChange={(v) => handleChange('subject', v)}
                        >
                            <SelectTrigger id="subject">
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUBJECTS.map(s => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Topic */}
                    <div className="space-y-2">
                        <Label htmlFor="topic">
                            Topic <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="topic"
                            placeholder="e.g., Quadratic Equations, Newton's Laws"
                            value={formData.topic}
                            onChange={(e) => handleChange('topic', e.target.value)}
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={(v) => handleChange('difficulty', v)}
                        >
                            <SelectTrigger id="difficulty">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTIES.map(d => (
                                    <SelectItem key={d} value={d}>
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Number of Questions */}
                    <div className="space-y-2">
                        <Label htmlFor="count">Number of Questions (1-20)</Label>
                        <Input
                            id="count"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.count}
                            onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        <p className="font-medium mb-1">ℹ️ How it works:</p>
                        <p className="text-xs">AI will generate {formData.count} MCQ questions with 4 options each. Questions will be marked as "pending" for your review before use.</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={loading} className="gap-2">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate Questions
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
