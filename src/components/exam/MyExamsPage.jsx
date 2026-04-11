import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Clock, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function MyExamsPage() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get('/teacher/exams');
            const data = response.data;
            setExams(data.exams || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (examId) => {
        if (!confirm('Are you sure you want to delete this exam?')) return;

        try {
            await api.delete(`/teacher/exams/${examId}`);

            toast.success('Exam deleted successfully');
            fetchExams(); // Refresh list
        } catch (error) {
            console.error('Error deleting exam:', error);
            toast.error('Failed to delete exam');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading exams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Exams</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage your finalized exams
                </p>
            </div>

            {exams.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No exams yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create and finalize your first exam to see it here
                            </p>
                            <Button onClick={() => window.location.href = '/dashboard/create-exam'}>
                                Create Exam
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {exams.map((exam) => (
                        <Card key={exam._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-4 w-4" />
                                                <span>{exam.subject}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{exam.duration} mins</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">{exam.totalMarks} marks</span>
                                            </div>

                                            {exam.createdAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{format(new Date(exam.createdAt), 'MMM d, yyyy')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {exam.board && (
                                            <div className="mt-2">
                                                <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                                                    {exam.board}
                                                </span>
                                                {exam.standard && (
                                                    <span className="inline-block bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-xs font-medium ml-2">
                                                        {exam.standard}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {exam.status && (
                                            <div className="mt-2">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${exam.status === 'finalized'
                                                        ? 'bg-green-100 text-green-800'
                                                        : exam.status === 'published'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Navigate to view exam
                                                toast.info('View exam feature coming soon!');
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(exam._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
