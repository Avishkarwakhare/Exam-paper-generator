import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Clock, FileText, CheckCircle2, PlayCircle, Calendar,
    LogOut, Menu, Home, User, GraduationCap, Phone, Mail, BarChart, ArrowLeft, XCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


const STUDENT_ID = "student_1";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'results' | 'scorecard'
    const [selectedAttempt, setSelectedAttempt] = useState(null);

    // Profile data state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        education: '',
        institution: '',
        address: '',
        city: '',
        state: '',
        country: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                // Fetch student's assigned exams
                const assignmentsRes = await api.get('/student/assignments');
                const assignmentsData = assignmentsRes.data;

                setAssignments(assignmentsData.assignments || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Load saved profile data from localStorage
        const savedProfile = localStorage.getItem('studentProfile');
        if (savedProfile) {
            setProfileData(JSON.parse(savedProfile));
        }

        fetchData();
    }, []);

    const handleStartExam = (assignmentId) => {
        navigate(`/student/exam/${assignmentId}`);
    };

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = () => {
        localStorage.setItem('studentProfile', JSON.stringify(profileData));
        toast({
            title: 'Profile saved!',
            description: 'Your information has been updated successfully.',
        });
        setProfileOpen(false);
    };

    const handleViewScorecard = (attempt) => {
        setSelectedAttempt(attempt);
        setCurrentView('scorecard');
    };

    const renderDashboard = () => {
        // Filter pending assignments only
        const pendingAssignments = assignments.filter(a => a.status === 'pending');

        return (
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Hi, {profileData.name || 'Student'}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome to your dashboard
                    </p>
                </div>

                {/* Assigned Exams */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">Assigned Exams</h2>
                    {pendingAssignments.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingAssignments.map(assignment => (
                                <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            {assignment.examTemplate?.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{assignment.examTemplate?.duration} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>{assignment.examTemplate?.totalMarks} marks</span>
                                        </div>
                                        {assignment.examTemplate?.subject && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                                                    {assignment.examTemplate.subject}
                                                </span>
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => handleStartExam(assignment._id)}
                                            className="w-full mt-4"
                                            size="sm"
                                        >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Start Exam
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No assigned exams available at the moment.
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        );
    };

    const renderResults = () => {
        // Filter and sort completed assignments by completion time (most recent first)
        const completedAssignments = assignments
            .filter(a => a.status === 'completed')
            .sort((a, b) => {
                if (!a.completedAt) return 1;
                if (!b.completedAt) return -1;
                return new Date(b.completedAt) - new Date(a.completedAt);
            });

        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Results</h1>
                    <p className="text-muted-foreground mt-1">View your exam history and performance</p>
                </div>

                {completedAssignments.length > 0 ? (
                    <div className="space-y-4">
                        {completedAssignments.map((assignment, index) => (
                            <Card
                                key={assignment._id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleViewScorecard(assignment)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                <span className="text-lg font-bold text-primary">#{completedAssignments.length - index}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-foreground">
                                                    {assignment.examTemplate?.title || 'Unknown Exam'}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    {assignment.completedAt && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(assignment.completedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                                        Completed
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">
                                                {assignment.score !== undefined ? assignment.score : 'N/A'}
                                            </div>
                                            <p className="text-sm text-muted-foreground">out of {assignment.totalMarks}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <BarChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>You haven't attempted any exams yet.</p>
                            <Button
                                className="mt-4"
                                onClick={() => setCurrentView('dashboard')}
                            >
                                View Active Exams
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderScorecard = () => {
        if (!selectedAttempt) return null;

        // Mock detailed result data - in production this would come from API
        // Creating sample questions to demonstrate the review functionality
        const mockWrongQuestions = selectedAttempt.score < 5 ? [
            {
                id: 'q1',
                text: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctOption: 2,
                selectedOption: 1
            },
            {
                id: 'q2',
                text: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctOption: 1,
                selectedOption: 0
            }
        ] : [];

        const mockResult = {
            score: selectedAttempt.score || 0,
            totalQuestions: 5,
            percentage: selectedAttempt.score ? `${((selectedAttempt.score / 5) * 100).toFixed(1)}%` : '0%',
            wrongQuestions: mockWrongQuestions
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setCurrentView('results');
                            setSelectedAttempt(null);
                        }}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Results
                    </Button>
                </div>

                {/* Score Summary Card */}
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle2 className="h-6 w-6" />
                            {getTemplateTitleById(selectedAttempt.examTemplateId)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-700">
                                    {mockResult.percentage}
                                </div>
                                <p className="text-sm text-green-800 mt-1">Percentage</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-700">
                                    {mockResult.score}
                                </div>
                                <p className="text-sm text-green-800 mt-1">Score</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-700">
                                    {mockResult.totalQuestions}
                                </div>
                                <p className="text-sm text-green-800 mt-1">Total Questions</p>
                            </div>
                        </div>
                        {selectedAttempt.submissionTime && (
                            <div className="flex items-center justify-center gap-2 text-sm text-green-800 pt-2 border-t border-green-200">
                                <Calendar className="h-4 w-4" />
                                <span>Submitted on {new Date(selectedAttempt.submissionTime).toLocaleString()}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Performance Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">Correct Answers</span>
                                </div>
                                <span className="text-lg font-bold text-green-600">{mockResult.score}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium">Incorrect Answers</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">
                                    {mockResult.totalQuestions - mockResult.score}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Question Review Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Review Incorrect Answers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mockResult.wrongQuestions && mockResult.wrongQuestions.length > 0 ? (
                            <div className="space-y-6">
                                {mockResult.wrongQuestions.map((q, index) => (
                                    <div key={q.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                                        <h3 className="font-medium text-lg mb-4">
                                            <span className="text-muted-foreground mr-2">Question {index + 1}:</span>
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
                                                                : 'bg-muted/30 border-border'
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
                                <p className="text-muted-foreground">You answered all questions correctly. Excellent work! 🎉</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="p-8 text-center">
                    <p className="text-center text-muted-foreground">Loading dashboard...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-8 text-center">
                    <p className="text-center text-destructive">Error: {error}</p>
                </div>
            );
        }

        if (currentView === 'results') {
            return renderResults();
        }

        if (currentView === 'scorecard') {
            return renderScorecard();
        }

        return renderDashboard();
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">ExamGen</span>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Student</span>
                </div>

                <nav className="p-4 space-y-1">
                    <button
                        onClick={() => {
                            setCurrentView('dashboard');
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${currentView === 'dashboard'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <Home className="h-4 w-4" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setCurrentView('results');
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${currentView === 'results' || currentView === 'scorecard'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <BarChart className="h-4 w-4" />
                        My Results
                    </button>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
                        <Link to="/">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur px-4 lg:px-6">
                    <button
                        className="lg:hidden p-2 -ml-2"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                            <DialogTrigger asChild>
                                <button className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-blue-800">
                                        {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'S'}
                                    </span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Student Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your personal information and academic details.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 mt-4">
                                    {/* Personal Information */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 text-foreground">Personal Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    <User className="inline h-4 w-4 mr-1" />
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Enter your full name"
                                                    value={profileData.name}
                                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    <Mail className="inline h-4 w-4 mr-1" />
                                                    Email *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    value={profileData.email}
                                                    onChange={(e) => handleProfileChange('email', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    <Phone className="inline h-4 w-4 mr-1" />
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+1 (555) 000-0000"
                                                    value={profileData.phone}
                                                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="age">Age</Label>
                                                <Input
                                                    id="age"
                                                    type="number"
                                                    placeholder="Enter your age"
                                                    value={profileData.age}
                                                    onChange={(e) => handleProfileChange('age', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gender">Gender</Label>
                                                <Select value={profileData.gender} onValueChange={(v) => handleProfileChange('gender', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic Information */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 text-foreground">Academic Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="education">
                                                    <GraduationCap className="inline h-4 w-4 mr-1" />
                                                    Education Level
                                                </Label>
                                                <Select value={profileData.education} onValueChange={(v) => handleProfileChange('education', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select education level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="high-school">High School</SelectItem>
                                                        <SelectItem value="associate">Associate Degree</SelectItem>
                                                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                                        <SelectItem value="master">Master's Degree</SelectItem>
                                                        <SelectItem value="doctorate">Doctorate/PhD</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="institution">Institution/School</Label>
                                                <Input
                                                    id="institution"
                                                    placeholder="Enter your school or university"
                                                    value={profileData.institution}
                                                    onChange={(e) => handleProfileChange('institution', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 text-foreground">Address</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="address">Street Address</Label>
                                                <Input
                                                    id="address"
                                                    placeholder="Enter your street address"
                                                    value={profileData.address}
                                                    onChange={(e) => handleProfileChange('address', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    placeholder="Enter city"
                                                    value={profileData.city}
                                                    onChange={(e) => handleProfileChange('city', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="state">State/Province</Label>
                                                <Input
                                                    id="state"
                                                    placeholder="Enter state or province"
                                                    value={profileData.state}
                                                    onChange={(e) => handleProfileChange('state', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Select value={profileData.country} onValueChange={(v) => handleProfileChange('country', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="us">United States</SelectItem>
                                                        <SelectItem value="uk">United Kingdom</SelectItem>
                                                        <SelectItem value="ca">Canada</SelectItem>
                                                        <SelectItem value="au">Australia</SelectItem>
                                                        <SelectItem value="in">India</SelectItem>
                                                        <SelectItem value="de">Germany</SelectItem>
                                                        <SelectItem value="fr">France</SelectItem>
                                                        <SelectItem value="cn">China</SelectItem>
                                                        <SelectItem value="jp">Japan</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button onClick={handleSaveProfile} className="flex-1">
                                            Save Profile
                                        </Button>
                                        <Button variant="outline" onClick={() => setProfileOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
