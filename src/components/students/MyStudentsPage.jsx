import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Search, ClipboardList, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AssignTestDialog } from '@/components/exam/AssignTestDialog';

export function MyStudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/teacher/students');
            const data = response.data;
            setStudents(data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter students based on search query
    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStudentInitials = (name) => {
        if (!name) return 'S';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading students...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Students</h1>
                <p className="text-muted-foreground mt-1">
                    Manage and assign exams to your students
                </p>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Students Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <User className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{students.length}</p>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{filteredStudents.length}</p>
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? 'Search Results' : 'Active Students'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Mail className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Pending Assignments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Students List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        All Students ({filteredStudents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            {searchQuery ? (
                                <>
                                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No students found matching "{searchQuery}"</p>
                                </>
                            ) : (
                                <>
                                    <User className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground mb-2">No students assigned yet</p>
                                    <p className="text-xs text-muted-foreground">
                                        Contact your administrator to assign students to you
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className="flex items-center gap-4 py-4 hover:bg-accent/50 transition-colors px-2 -mx-2 rounded"
                                >
                                    {/* Student Avatar */}
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-base font-semibold text-primary">
                                            {getStudentInitials(student.name)}
                                        </span>
                                    </div>

                                    {/* Student Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate">
                                            {student.name || 'Unnamed Student'}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                            {student.createdAt && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Joined {format(new Date(student.createdAt), 'MMM d, yyyy')}</span>
                                                </div>
                                            )}
                                        </div>
                                        {student.phone && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Phone: {student.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setAssignDialogOpen(true);
                                            }}
                                        >
                                            <ClipboardList className="h-3 w-3 mr-1" />
                                            Assign Test
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assign Test Dialog */}
            {selectedStudent && (
                <AssignTestDialog
                    open={assignDialogOpen}
                    onOpenChange={setAssignDialogOpen}
                    studentId={selectedStudent._id}
                    studentName={selectedStudent.name}
                    onAssignComplete={fetchStudents}
                />
            )}
        </div>
    );
}
