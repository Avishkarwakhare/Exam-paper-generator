import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  Home,
  BookOpen,
  User,
  Trash2,
  Settings
} from 'lucide-react';
import { ExamGenerator } from '@/components/exam/ExamGenerator';
import { ExamPreview } from '@/components/exam/ExamPreview';
import { ExamViewPage } from '@/components/exam/ExamViewPage';
import { ProfileDialog } from '@/components/profile/ProfileDialog';
import { MyStudentsPage } from '@/components/students/MyStudentsPage';
import { useQuestionBank } from '@/context/QuestionBankContext';

const navItems = [
  { label: 'Overview', icon: Home, path: '/dashboard' },
  { label: 'Create Exam', icon: ClipboardList, path: '/dashboard/create-exam' },
  { label: 'My Exams', icon: FileText, path: '/dashboard/exams' },
  { label: 'My Students', icon: BookOpen, path: '/dashboard/students' },
];

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch current user
      const userResponse = await api.get('/auth/me');
      setCurrentUser(userResponse.data.user);
  
      // Fetch questions
      const questionsResponse = await api.get('/teacher/questions');
  
      // Fetch exams
      const examsResponse = await api.get('/teacher/exams');
  
      // Fetch students
      const studentsResponse = await api.get('/teacher/students');
  
      setStats({
        totalQuestions: questionsResponse.data.questions?.length || 0,
        totalExams: examsResponse.data.exams?.length || 0
      });
  
      // Get 5 most recent exams
      const sortedExams = (examsResponse.data.exams || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentExams(sortedExams);
  
      setStudents(studentsResponse.data.students || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Questions',
      value: stats.totalQuestions,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      label: 'Exams Created',
      value: stats.totalExams,
      icon: FileText,
      color: 'bg-green-500'
    }
  ];

  // Get first name from user
  const getFirstName = () => {
    if (!currentUser?.name) return '';
    return currentUser.name.split(' ')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{getFirstName() ? `, ${getFirstName()}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your exam management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link to="/dashboard/create-exam">
              <ClipboardList className="mr-2 h-4 w-4" />
              Create New Exam
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Exams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Exams</CardTitle>
          {recentExams.length > 0 && (
            <Button size="sm" asChild>
              <Link to="/dashboard/exams">View All</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentExams.length === 0 ? (
            <p className="text-muted-foreground text-sm">No exams created yet.</p>
          ) : (
            <div className="space-y-0 divide-y">
              {recentExams.map((exam) => (
                <div key={exam._id} className="flex justify-between items-center py-3 hover:bg-accent/50 transition-colors px-2 -mx-2 rounded">
                  <div className="flex-1">
                    <span className="font-medium text-sm block">{exam.title}</span>
                    <span className="text-xs text-muted-foreground">{exam.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{exam.totalMarks} marks</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/exams/${exam._id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Students</CardTitle>
          {students.length > 0 && (
            <Button size="sm" asChild>
              <Link to="/dashboard/students">View All</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No students assigned yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Students will appear here once assigned by admin.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y">
              {students.slice(0, 5).map((student) => (
                <div key={student._id} className="flex items-center gap-3 py-3 hover:bg-accent/50 transition-colors px-2 -mx-2 rounded">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {student.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm block">{student.name}</span>
                    <span className="text-xs text-muted-foreground">{student.email}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    Assign Test
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function CreateExamPage() {
  return (
    <div className="space-y-6">
      <ExamGenerator />
    </div>
  );
}

function MyExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/teacher/exams');
      setExams(response.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      await api.delete(`/teacher/exams/${examId}`);
      fetchExams(); // Refresh list
    } catch (error) {
      console.error('Error deleting exam:', error);
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
        <h1 className="text-3xl font-bold text-foreground">My Exams</h1>
        <p className="text-muted-foreground mt-1">View and manage your finalized exams</p>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No exams finalized yet.</p>
            <Button asChild className="mt-4">
              <Link to="/dashboard/create-exam">Create Your First Exam</Link>
            </Button>
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
                        <span className="font-medium">{exam.totalMarks} marks</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span>{exam.duration} mins</span>
                      </div>
                    </div>

                    {exam.status && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${exam.status === 'finalized'
                          ? 'bg-green-100 text-green-800'
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
                      asChild
                    >
                      <Link to={`/dashboard/exams/${exam._id}`}>
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Link>
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

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getUserInitials = () => {
    if (!currentUser?.name) return 'T';
    return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Profile Dialog */}
      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        currentUser={currentUser}
        onProfileUpdate={fetchUserData}
      />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">ExamGen</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

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

          {/* Profile Menu */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="flex items-center gap-2 hover:bg-accent rounded-lg p-2 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{getUserInitials()}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{currentUser?.name || 'Teacher'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-card border border-border rounded-lg shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="create-exam" element={<CreateExamPage />} />
            <Route path="exams" element={<MyExamsPage />} />
            <Route path="exams/:examId" element={<ExamViewPage />} />
            <Route path="students" element={<MyStudentsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
