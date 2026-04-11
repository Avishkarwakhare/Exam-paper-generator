import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useQuestionBank } from '@/context/QuestionBankContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Calculator,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { ExamPreview } from './ExamPreview';

const BOARDS = [
  "CBSE",
  "ICSE",
  "State Board",
  "Autonomous College",
  "University Examination"
];

const STANDARDS = [
  "Class 10",
  "Class 12",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8"
];

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

export function ExamGenerator() {
  const { addExam } = useQuestionBank();

  const [examDetails, setExamDetails] = useState({
    board: '',
    standard: '',
    subject: '',
    topics: '',
    duration: 180,
    totalMarks: 100
  });

  const [distribution, setDistribution] = useState([
    { id: 1, count: 10, marks: 1, difficulty: 'Easy', type: 'MCQ' },
    { id: 2, count: 5, marks: 4, difficulty: 'Medium', type: 'MCQ' },
    { id: 3, count: 3, marks: 10, difficulty: 'Hard', type: 'MCQ' },
  ]);

  const [generatedExam, setGeneratedExam] = useState(null);
  const [allocatedMarks, setAllocatedMarks] = useState(0);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const total = distribution.reduce((sum, row) => sum + (row.count * row.marks), 0);
    setAllocatedMarks(total);
  }, [distribution]);

  const handleDetailChange = (field, value) => {
    setExamDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleDistributionChange = (id, field, value) => {
    setDistribution(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addDistributionRow = () => {
    const newId = Math.max(...distribution.map(d => d.id), 0) + 1;
    setDistribution([...distribution, {
      id: newId,
      count: 1,
      marks: 1,
      difficulty: 'Medium',
      type: 'MCQ' // Always MCQ
    }]);
  };

  const removeDistributionRow = (id) => {
    if (distribution.length === 1) {
      toast.warning("You must have at least one question group.");
      return;
    }
    setDistribution(distribution.filter(row => row.id !== id));
  };

  const getSuggestedTopics = async () => {
    if (!examDetails.subject) {
      toast.error('Please select a subject first');
      return;
    }

    setLoadingSuggestions(true);

    // Subject-specific topic suggestions
    const subjectTopics = {
      'Mathematics': ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Probability', 'Number Theory', 'Linear Equations'],
      'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Modern Physics', 'Waves', 'Kinematics', 'Dynamics'],
      'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Chemical Bonding', 'Thermochemistry', 'Electrochemistry', 'Acids and Bases', 'Periodic Table'],
      'Computer Science': ['Data Structures', 'Algorithms', 'OOP Concepts', 'Database Management', 'Operating Systems', 'Networks', 'Web Development', 'Software Engineering'],
      'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Anatomy', 'Plant Physiology', 'Microbiology', 'Biotechnology'],
      'English': ['Grammar', 'Literature', 'Composition', 'Poetry', 'Drama', 'Prose', 'Vocabulary', 'Comprehension'],
      'History': ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Independence Movement', 'Cultural History', 'Political History', 'Economic History'],
      'Geography': ['Physical Geography', 'Human Geography', 'Climate', 'Natural Resources', 'Population', 'Agriculture', 'Industries', 'Map Reading'],
      'Economics': ['Microeconomics', 'Macroeconomics', 'Money and Banking', 'Public Finance', 'International Trade', 'Development Economics', 'Indian Economy', 'Economic Policies'],
      'Commerce': ['Accounting', 'Business Studies', 'Economics', 'Marketing', 'Finance', 'Business Law', 'Entrepreneurship', 'Cost Accounting']
    };

    // Small delay to show loading state
    setTimeout(() => {
      const suggestions = subjectTopics[examDetails.subject] || ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5'];
      setTopicSuggestions(suggestions);
      setLoadingSuggestions(false);
      toast.success('Topic suggestions ready!');
    }, 300);
  };

  const addTopicSuggestion = (topic) => {
    const currentTopics = examDetails.topics.trim();
    const newTopics = currentTopics
      ? `${currentTopics}, ${topic}`
      : topic;
    handleDetailChange('topics', newTopics);
  };

  const generateExam = async () => {
    // Basic Validation
    if (!examDetails.subject || !examDetails.board) {
      toast.error("Please fill in basic exam details (Board, Subject).");
      return;
    }

    // Clear any existing generated exam to show regeneration is happening
    setGeneratedExam(null);

    // Show loading toast with unique ID
    const loadingToastId = `generate-${Date.now()}`;
    toast.loading("Generating question paper with AI...", { id: loadingToastId });

    try {
      // Call AI for each section to generate questions
      const allQuestions = [];

      for (const section of distribution) {
        // Try to call AI first
        let sectionQuestions = [];

        try {
          // Add timestamp to ensure different requests each time
          const response = await api.post('/ai/generate-questions', {
            subject: examDetails.subject,
            topic: examDetails.topics || `${examDetails.subject} general topics`,
            difficulty: section.difficulty,
            count: parseInt(section.count),
            timestamp: Date.now() // Force new generation
          });

          if (response.status === 200) {
            const data = response.data;
            // Add section metadata to AI-generated questions
            sectionQuestions = data.questions.map(q => ({
              ...q,
              id: crypto.randomUUID(),
              marks: parseInt(section.marks),
              type: 'mcq',
              difficulty: section.difficulty.toLowerCase()
            }));
          } else {
            throw new Error('AI generation failed');
          }
        } catch (aiError) {
          // Fallback: Create better mock questions
          console.log('Using fallback question generation');
          sectionQuestions = createMockQuestions(
            examDetails.subject,
            examDetails.topics,
            section.difficulty,
            parseInt(section.count),
            parseInt(section.marks)
          );
        }

        allQuestions.push(...sectionQuestions);
      }

      const newExam = {
        id: crypto.randomUUID(),
        title: `${examDetails.subject} - ${examDetails.standard} (${examDetails.board})`,
        questions: allQuestions,
        totalMarks: allocatedMarks,
        duration: examDetails.duration,
        subject: examDetails.subject,
        metadata: { ...examDetails, distribution },
        createdAt: new Date(),
        status: 'draft' // Not finalized yet
      };

      setGeneratedExam(newExam);
      toast.success("Questions generated successfully! Review and finalize when ready.", { id: loadingToastId });

    } catch (error) {
      console.error('Error generating exam:', error);
      toast.error("Failed to generate questions. Please try again.", { id: loadingToastId });
    }
  };

  // Helper function to create better mock questions with realistic content
  const createMockQuestions = (subject, topics, difficulty, count, marks) => {
    const questions = [];

    // Subject-specific question templates
    const questionBank = {
      'Mathematics': {
        'Easy': [
          { q: 'What is 25 × 4?', opts: ['100', '90', '110', '95'], ans: 0 },
          { q: 'What is the value of π (pi) approximately?', opts: ['3.14', '2.71', '1.41', '3.33'], ans: 0 },
          { q: 'What is 15% of 200?', opts: ['30', '25', '35', '40'], ans: 0 },
          { q: 'What is the square root of 144?', opts: ['12', '14', '10', '16'], ans: 0 },
          { q: 'What is 7³ (7 cubed)?', opts: ['343', '49', '147', '294'], ans: 0 },
          { q: 'What is the sum of angles in a triangle?', opts: ['180°', '360°', '90°', '270°'], ans: 0 }
        ],
        'Medium': [
          { q: 'Solve: 3x + 5 = 20', opts: ['x = 5', 'x = 7', 'x = 3', 'x = 6'], ans: 0 },
          { q: 'What is the area of a triangle with base 10cm and height 6cm?', opts: ['30 cm²', '60 cm²', '15 cm²', '20 cm²'], ans: 0 },
          { q: 'If sin θ = 0.5, what is θ (in degrees)?', opts: ['30°', '45°', '60°', '90°'], ans: 0 },
          { q: 'What is the slope of the line y = 3x + 2?', opts: ['3', '2', '1', '0'], ans: 0 }
        ],
        'Hard': [
          { q: 'Find the derivative of f(x) = x³ - 3x²', opts: ['3x² - 6x', '3x² + 6x', 'x² - 6x', '3x² - 3x'], ans: 0 },
          { q: 'What is the integral of 2x?', opts: ['x² + C', '2x² + C', 'x + C', '2 + C'], ans: 0 },
          { q: 'Solve the quadratic equation: x² - 5x + 6 = 0', opts: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 0, 5'], ans: 0 }
        ]
      },
      'Physics': {
        'Easy': [
          { q: 'What is the SI unit of force?', opts: ['Newton', 'Joule', 'Watt', 'Pascal'], ans: 0 },
          { q: 'What is the speed of light in vacuum?', opts: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁷ m/s', '3 × 10⁹ m/s'], ans: 0 },
          { q: 'What is the unit of electric current?', opts: ['Ampere', 'Volt', 'Ohm', 'Watt'], ans: 0 },
          { q: 'What is the acceleration due to gravity on Earth?', opts: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²'], ans: 0 },
          { q: 'Which law states "Every action has an equal and opposite reaction"?', opts: ['Newton\'s Third Law', 'Newton\'s First Law', 'Newton\'s Second Law', 'Law of Gravitation'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is Newton\'s second law of motion?', opts: ['F = ma', 'F = m/a', 'F = a/m', 'F = m + a'], ans: 0 },
          { q: 'What is the formula for kinetic energy?', opts: ['½mv²', 'mgh', 'mv', 'ma'], ans: 0 },
          { q: 'What is Ohm\'s Law?', opts: ['V = IR', 'I = VR', 'R = VI', 'V = I/R'], ans: 0 },
          { q: 'What type of lens is used to correct myopia?', opts: ['Concave lens', 'Convex lens', 'Bifocal lens', 'Cylindrical lens'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the escape velocity from Earth\'s surface?', opts: ['11.2 km/s', '9.8 km/s', '7.9 km/s', '15.6 km/s'], ans: 0 },
          { q: 'What is the work function in photoelectric effect?', opts: ['Minimum energy to eject electron', 'Maximum energy of photon', 'Kinetic energy of electron', 'Frequency of light'], ans: 0 },
          { q: 'What is the unit of magnetic flux?', opts: ['Weber', 'Tesla', 'Gauss', 'Henry'], ans: 0 }
        ]
      },
      'Chemistry': {
        'Easy': [
          { q: 'What is the chemical symbol for water?', opts: ['H₂O', 'CO₂', 'O₂', 'H₂'], ans: 0 },
          { q: 'What is the atomic number of Carbon?', opts: ['6', '8', '12', '14'], ans: 0 },
          { q: 'What is the pH of pure water?', opts: ['7', '0', '14', '10'], ans: 0 },
          { q: 'Which gas is most abundant in Earth\'s atmosphere?', opts: ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Argon'], ans: 0 },
          { q: 'What is the formula for common salt?', opts: ['NaCl', 'KCl', 'CaCl₂', 'MgCl₂'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is Avogadro\'s number?', opts: ['6.022 × 10²³', '6.022 × 10²²', '3.14 × 10²³', '1.6 × 10⁻¹⁹'], ans: 0 },
          { q: 'What is the molecular formula of benzene?', opts: ['C₆H₆', 'C₆H₁₂', 'C₆H₁₄', 'CH₄'], ans: 0 },
          { q: 'What type of bond is found in a molecule of nitrogen (N₂)?', opts: ['Triple covalent bond', 'Double covalent bond', 'Single covalent bond', 'Ionic bond'], ans: 0 },
          { q: 'Which element has the electronic configuration 2,8,8,2?', opts: ['Calcium', 'Magnesium', 'Argon', 'Potassium'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the hybridization of carbon in methane (CH₄)?', opts: ['sp³', 'sp²', 'sp', 'sp³d'], ans: 0 },
          { q: 'Which of the following is an example of a Friedel-Crafts reaction?', opts: ['Alkylation of benzene', 'Nitration of benzene', 'Sulfonation of benzene', 'Halogenation of alkane'], ans: 0 },
          { q: 'What is the standard enthalpy of formation of elements in their standard state?', opts: ['Zero', 'Positive', 'Negative', 'Variable'], ans: 0 }
        ]
      },
      'Computer Science': {
        'Easy': [
          { q: 'What does CPU stand for?', opts: ['Central Processing Unit', 'Central Program Unit', 'Computer Personal Unit', 'Central Processor Utility'], ans: 0 },
          { q: 'Which of the following is a programming language?', opts: ['Python', 'HTTP', 'HTML', 'CSS'], ans: 0 },
          { q: 'What is the full form of RAM?', opts: ['Random Access Memory', 'Read Access Memory', 'Rapid Access Memory', 'Random Allocated Memory'], ans: 0 },
          { q: 'What is binary number system based on?', opts: ['0 and 1', '0 to 9', 'A to Z', '0 to 7'], ans: 0 },
          { q: 'Which device is used to input data into a computer?', opts: ['Keyboard', 'Monitor', 'Speaker', 'Printer'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is the time complexity of binary search?', opts: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], ans: 0 },
          { q: 'Which data structure uses LIFO principle?', opts: ['Stack', 'Queue', 'Array', 'Linked List'], ans: 0 },
          { q: 'What does SQL stand for?', opts: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'], ans: 0 },
          { q: 'Which sorting algorithm has best average case complexity?', opts: ['Quick Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the space complexity of merge sort?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], ans: 0 },
          { q: 'Which design pattern ensures a class has only one instance?', opts: ['Singleton', 'Factory', 'Observer', 'Decorator'], ans: 0 },
          { q: 'What is the purpose of a semaphore in operating systems?', opts: ['Process synchronization', 'Memory allocation', 'File management', 'CPU scheduling'], ans: 0 }
        ]
      },
      'Biology': {
        'Easy': [
          { q: 'What is the powerhouse of the cell?', opts: ['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast'], ans: 0 },
          { q: 'What is the basic unit of life?', opts: ['Cell', 'Tissue', 'Organ', 'Molecule'], ans: 0 },
          { q: 'Which organ pumps blood in the human body?', opts: ['Heart', 'Lungs', 'Liver', 'Kidney'], ans: 0 },
          { q: 'What is the process by which plants make food?', opts: ['Photosynthesis', 'Respiration', 'Digestion', 'Absorption'], ans: 0 },
          { q: 'How many chromosomes do humans have?', opts: ['46', '23', '92', '48'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is the function of hemoglobin?', opts: ['Oxygen transport', 'Blood clotting', 'Immunity', 'Digestion'], ans: 0 },
          { q: 'Which organelle is responsible for protein synthesis?', opts: ['Ribosome', 'Mitochondria', 'Golgi apparatus', 'Lysosome'], ans: 0 },
          { q: 'What is the structural and functional unit of kidney?', opts: ['Nephron', 'Neuron', 'Alveoli', 'Villi'], ans: 0 },
          { q: 'What type of blood vessels carry blood away from the heart?', opts: ['Arteries', 'Veins', 'Capillaries', 'Venules'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the role of RNA polymerase in transcription?', opts: ['Synthesizes RNA from DNA template', 'Replicates DNA', 'Translates RNA to protein', 'Repairs DNA damage'], ans: 0 },
          { q: 'Which process occurs during the light-independent reactions of photosynthesis?', opts: ['Calvin cycle', 'Electron transport chain', 'Water splitting', 'ATP synthesis'], ans: 0 },
          { q: 'What is the sigmoid curve in population growth called?', opts: ['Logistic growth', 'Exponential growth', 'Linear growth', 'Zero growth'], ans: 0 }
        ]
      },
      'English': {
        'Easy': [
          { q: 'What is the plural of "child"?', opts: ['Children', 'Childs', 'Childrens', 'Childes'], ans: 0 },
          { q: 'Which is a noun?', opts: ['Book', 'Run', 'Beautiful', 'Quickly'], ans: 0 },
          { q: 'What is the opposite of "happy"?', opts: ['Sad', 'Angry', 'Excited', 'Calm'], ans: 0 },
          { q: 'Identify the verb: "She runs every morning"', opts: ['Runs', 'She', 'Every', 'Morning'], ans: 0 },
          { q: 'What is the past tense of "go"?', opts: ['Went', 'Gone', 'Going', 'Goes'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is a metaphor?', opts: ['A comparison without using like or as', 'A comparison using like or as', 'An exaggeration', 'A sound imitation'], ans: 0 },
          { q: 'Which is the correct sentence?', opts: ['She has been working here since 2020.', 'She has been working here from 2020.', 'She is working here since 2020.', 'She works here from 2020.'], ans: 0 },
          { q: 'What is the subject in: "The cat chased the mouse"?', opts: ['The cat', 'Chased', 'The mouse', 'Cat chased'], ans: 0 },
          { q: 'Identify the adverb: "He speaks very softly"', opts: ['Softly', 'Speaks', 'Very', 'He'], ans: 0 }
        ],
        'Hard': [
          { q: 'What literary device is used in "The wind whispered through the trees"?', opts: ['Personification', 'Simile', 'Metaphor', 'Alliteration'], ans: 0 },
          { q: 'Which sentence uses the subjunctive mood correctly?', opts: ['If I were you, I would go.', 'If I was you, I would go.', 'If I am you, I would go.', 'If I will be you, I would go.'], ans: 0 },
          { q: 'What is a zeugma?', opts: ['Using one word to modify two different words', 'Repetition of vowel sounds', 'Reversal of word order', 'Exaggeration for effect'], ans: 0 }
        ]
      },
      'History': {
        'Easy': [
          { q: 'When did India gain independence?', opts: ['1947', '1950', '1942', '1945'], ans: 0 },
          { q: 'Who was the first Prime Minister of India?', opts: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel', 'Subhas Chandra Bose'], ans: 0 },
          { q: 'In which year did World War II end?', opts: ['1945', '1944', '1946', '1943'], ans: 0 },
          { q: 'Who discovered America?', opts: ['Christopher Columbus', 'Vasco da Gama', 'Marco Polo', 'Ferdinand Magellan'], ans: 0 },
          { q: 'The Great Wall of China was built to protect against which invaders?', opts: ['Mongols', 'Persians', 'Romans', 'Greeks'], ans: 0 }
        ],
        'Medium': [
          { q: 'Who led the Salt March (Dandi March)?', opts: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Bal Gangadhar Tilak', 'Lala Lajpat Rai'], ans: 0 },
          { q: 'What year did the Quit India Movement begin?', opts: ['1942', '1940', '1945', '1930'], ans: 0 },
          { q: 'The French Revolution began in which year?', opts: ['1789', '1799', '1776', '1804'], ans: 0 },
          { q: 'Who was known as the Iron Man of India?', opts: ['Sardar Vallabhbhai Patel', 'Subhas Chandra Bose', 'Bhagat Singh', 'Lal Bahadur Shastri'], ans: 0 }
        ],
        'Hard': [
          { q: 'Who was the Viceroy of India during the Partition?', opts: ['Lord Mountbatten', 'Lord Wavell', 'Lord Linlithgow', 'Lord Irwin'], ans: 0 },
          { q: 'The Treaty of Versailles was signed in which year?', opts: ['1919', '1918', '1920', '1921'], ans: 0 },
          { q: 'Which Mughal emperor built the Taj Mahal?', opts: ['Shah Jahan', 'Akbar', 'Aurangzeb', 'Jahangir'], ans: 0 }
        ]
      },
      'Geography': {
        'Easy': [
          { q: 'What is the largest continent?', opts: ['Asia', 'Africa', 'North America', 'Europe'], ans: 0 },
          { q: 'Which is the longest river in the world?', opts: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'], ans: 0 },
          { q: 'What is the capital of India?', opts: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'], ans: 0 },
          { q: 'Which ocean is the largest?', opts: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], ans: 0 },
          { q: 'Mount Everest is located in which mountain range?', opts: ['Himalayas', 'Andes', 'Alps', 'Rockies'], ans: 0 }
        ],
        'Medium': [
          { q: 'Which mountain range separates Europe from Asia?', opts: ['Ural Mountains', 'Himalayas', 'Alps', 'Andes'], ans: 0 },
          { q: 'What is the capital of Australia?', opts: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'], ans: 0 },
          { q: 'Which desert is the largest in the world?', opts: ['Sahara Desert', 'Arabian Desert', 'Gobi Desert', 'Kalahari Desert'], ans: 0 },
          { q: 'The Tropic of Cancer passes through how many Indian states?', opts: ['8', '5', '10', '12'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the approximate percentage of Earth\'s surface covered by oceans?', opts: ['71%', '60%', '80%', '50%'], ans: 0 },
          { q: 'Which strait separates India and Sri Lanka?', opts: ['Palk Strait', 'Strait of Hormuz', 'Strait of Gibraltar', 'Bering Strait'], ans: 0 },
          { q: 'What is the deepest point in the ocean called?', opts: ['Mariana Trench', 'Tonga Trench', 'Puerto Rico Trench', 'Java Trench'], ans: 0 }
        ]
      },
      'Economics': {
        'Easy': [
          { q: 'What does GDP stand for?', opts: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Global Domestic Product'], ans: 0 },
          { q: 'What is the basic economic problem?', opts: ['Scarcity', 'Unemployment', 'Inflation', 'Poverty'], ans: 0 },
          { q: 'Which organization regulates monetary policy in India?', opts: ['RBI', 'SEBI', 'NITI Aayog', 'Finance Ministry'], ans: 0 },
          { q: 'What is the currency of Japan?', opts: ['Yen', 'Yuan', 'Won', 'Ringgit'], ans: 0 },
          { q: 'In economics, what does "supply and demand" determine?', opts: ['Price', 'Quality', 'Quantity only', 'Brand value'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is inflation?', opts: ['General increase in prices', 'Decrease in prices', 'Stable prices', 'Government spending'], ans: 0 },
          { q: 'What type of market has only one seller?', opts: ['Monopoly', 'Oligopoly', 'Perfect competition', 'Duopoly'], ans: 0 },
          { q: 'What is the law of demand?', opts: ['Price increases, demand decreases', 'Price decreases, demand decreases', 'Price and demand are unrelated', 'Price increases, demand increases'], ans: 0 },
          { q: 'What is fiscal policy?', opts: ['Government spending and taxation', 'Monetary supply control', 'Exchange rate management', 'Trade policy'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the Philips Curve relationship?', opts: ['Inflation and unemployment', 'GDP and inflation', 'Supply and demand', 'Interest rate and growth'], ans: 0 },
          { q: 'What is marginal utility?', opts: ['Additional satisfaction from one more unit', 'Total satisfaction', 'Average satisfaction', 'Maximum satisfaction'], ans: 0 },
          { q: 'In perfect competition, firms are:', opts: ['Price takers', 'Price makers', 'Price discriminators', 'Monopolists'], ans: 0 }
        ]
      },
      'Commerce': {
        'Easy': [
          { q: 'What does the term "debit" mean in accounting?', opts: ['Left side of account', 'Right side of account', 'Loss', 'Profit'], ans: 0 },
          { q: 'What is a balance sheet?', opts: ['Statement of assets and liabilities', 'Statement of income', 'Cash flow statement', 'Budget statement'], ans: 0 },
          { q: 'GST stands for:', opts: ['Goods and Services Tax', 'General Sales Tax', 'Government Service Tax', 'Goods Supply Tax'], ans: 0 },
          { q: 'What is equity in business?', opts: ['Owner\'s capital', 'Borrowed capital', 'Revenue', 'Expenses'], ans: 0 },
          { q: 'Which document is used to record daily transactions?', opts: ['Journal', 'Ledger', 'Trial Balance', 'Balance Sheet'], ans: 0 }
        ],
        'Medium': [
          { q: 'What is the accounting equation?', opts: ['Assets = Liabilities + Equity', 'Assets = Revenue - Expenses', 'Assets = Liabilities - Equity', 'Profit = Revenue - Expenses'], ans: 0 },
          { q: 'What is depreciation?', opts: ['Decrease in asset value over time', 'Increase in asset value', 'Interest on loan', 'Profit from sale'], ans: 0 },
          { q: 'What is working capital?', opts: ['Current Assets - Current Liabilities', 'Total Assets - Total Liabilities', 'Revenue - Expenses', 'Cash + Bank'], ans: 0 },
          { q: 'What is a trial balance used for?', opts: ['Check arithmetic accuracy', 'Calculate profit', 'Show financial position', 'Record transactions'], ans: 0 }
        ],
        'Hard': [
          { q: 'What is the double-entry system principle?', opts: ['Every debit has a corresponding credit', 'Assets equal liabilities', 'Revenue equals expenses', 'Cash basis accounting'], ans: 0 },
          { q: 'What is a contingent liability?', opts: ['Potential future obligation', 'Current obligation', 'Past obligation settled', 'Revenue receivable'], ans: 0 },
          { q: 'Which method is used for inventory valuation?', opts: ['FIFO, LIFO, Weighted Average', 'Only FIFO', 'Only LIFO', 'Cash basis only'], ans: 0 }
        ]
      }
    };

    // Get appropriate difficulty questions
    const subjectBank = questionBank[subject] || {};
    const diffBank = subjectBank[difficulty] || [];

    // Shuffle the question bank for variety
    const shuffledBank = [...diffBank].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      if (shuffledBank.length > 0) {
        // Use real question from bank (cycle through if needed)
        const template = shuffledBank[i % shuffledBank.length];
        questions.push({
          id: crypto.randomUUID(),
          text: template.q,
          type: 'mcq',
          difficulty: difficulty.toLowerCase(),
          marks: marks,
          options: template.opts,
          correctOption: template.ans,
          subject: subject,
          topic: topics || subject
        });
      } else {
        // Fallback for subjects without question bank
        questions.push({
          id: crypto.randomUUID(),
          text: `Sample ${difficulty} question ${i + 1} for ${subject}${topics ? ' - ' + topics.split(',')[0].trim() : ''}`,
          type: 'mcq',
          difficulty: difficulty.toLowerCase(),
          marks: marks,
          options: [
            `Option A`,
            `Option B`,
            `Option C`,
            `Option D`
          ],
          correctOption: 0,
          subject: subject,
          topic: topics || subject
        });
      }
    }

    return questions;
  };

  const getSectionLabel = (index) => String.fromCharCode(65 + index);

  if (generatedExam) {
    return (
      <ExamPreview
        exam={generatedExam}
        onBack={() => setGeneratedExam(null)}
        onRegenerate={generateExam}
        showFinalize={true}
      />
    );
  }

  // If exam is generated, show preview instead
  if (generatedExam) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Preview & Edit Exam</h1>
            <p className="text-muted-foreground">Review AI-generated questions and make any changes before finalizing.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGeneratedExam(null)}>
              Go Back
            </Button>
            <Button onClick={() => {
              addExam(generatedExam);
              toast.success("Exam finalized and saved!");
              setGeneratedExam(null);
              // Reset form
              setExamDetails({ board: '', standard: '', subject: '', topics: '', duration: 180, totalMarks: 100 });
              setDistribution([{ id: 1, count: 10, marks: 1, difficulty: 'Easy', type: 'MCQ' }]);
            }} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Confirm Changes
            </Button>
          </div>
        </div>

        {/* Exam Preview with Edit Capability - using ExamPreview component */}
        <ExamPreview
          exam={generatedExam}
          onBack={() => setGeneratedExam(null)}
          onRegenerate={generateExam}
          editable={true}
          onUpdate={(updatedExam) => setGeneratedExam(updatedExam)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl">

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Create Exam Paper</h1>
        <p className="text-muted-foreground">Define academic context and question structure. AI will generate questions automatically.</p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

        {/* LEFT COLUMN: EXAM DETAILS */}
        <Card className="shadow-sm border-slate-200 h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <FileText className="h-5 w-5 text-primary" />
              Exam Details
            </CardTitle>
            <CardDescription>Academic parameters for the exam</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">

            {/* Board & Standard Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Board / University</Label>
                <Select value={examDetails.board} onValueChange={(val) => handleDetailChange('board', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Class / Semester</Label>
                <Select value={examDetails.standard} onValueChange={(val) => handleDetailChange('standard', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {STANDARDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject & Duration Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Subject</Label>
                <Select value={examDetails.subject} onValueChange={(val) => handleDetailChange('subject', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Duration (mins)</Label>
                <Input
                  type="number"
                  className="bg-white"
                  value={examDetails.duration}
                  onChange={(e) => handleDetailChange('duration', e.target.value)}
                />
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Topics / Chapters</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={getSuggestedTopics}
                  disabled={!examDetails.subject || loadingSuggestions}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {loadingSuggestions ? 'Suggesting...' : 'Suggest Topics'}
                </Button>
              </div>
              <Textarea
                placeholder="e.g. Calculus, Optics, Organic Chemistry..."
                className="bg-white min-h-[100px] resize-none"
                value={examDetails.topics}
                onChange={(e) => handleDetailChange('topics', e.target.value)}
              />
              {topicSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-xs font-medium text-purple-700 w-full mb-1">Click to add:</span>
                  {topicSuggestions.map((topic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addTopicSuggestion(topic)}
                      className="px-3 py-1 text-sm bg-white border border-purple-300 rounded-full hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTopicSuggestions([])}
                    className="px-3 py-1 text-xs text-purple-600 hover:text-purple-800"
                  >
                    Clear suggestions
                  </button>
                </div>
              )}
            </div>

            {/* Total Marks Highlight */}
            <div className="pt-2">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <Label className="text-base font-semibold text-slate-700">Total Exam Marks</Label>
                <Input
                  type="number"
                  className="w-32 bg-white text-right font-bold text-lg"
                  value={examDetails.totalMarks}
                  onChange={(e) => handleDetailChange('totalMarks', e.target.value)}
                />
              </div>
            </div>

          </CardContent>
        </Card>


        {/* RIGHT COLUMN: QUESTION DISTRIBUTION */}
        <Card className="shadow-sm border-slate-200 h-fit flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Calculator className="h-5 w-5 text-primary" />
                  Question Distribution
                </CardTitle>
                <CardDescription>Configure sections (A, B, C...)</CardDescription>
              </div>
              {/* Visual Counter badge */}
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wide">
                {distribution.length} Sections
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6 flex-1">

            <div className="space-y-5">
              {distribution.map((row, index) => (
                <div key={row.id} className="relative group">
                  {/* Section Connector Line (visual polish) */}
                  {index !== distribution.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100 -z-10" />
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors">

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 text-sm">
                          {getSectionLabel(index)}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700">Section {getSectionLabel(index)}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeDistributionRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Inputs Grid - Only QTY, MARKS, DIFF */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">QTY</Label>
                        <Input
                          type="number" min="1"
                          className="h-9 text-center"
                          value={row.count}
                          onChange={(e) => handleDistributionChange(row.id, 'count', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MARKS/Q</Label>
                        <Input
                          type="number" min="1"
                          className="h-9 text-center"
                          value={row.marks}
                          onChange={(e) => handleDistributionChange(row.id, 'marks', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DIFF</Label>
                        <Select value={row.difficulty} onValueChange={(val) => handleDistributionChange(row.id, 'difficulty', val)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addDistributionRow}
              className="w-full border-dashed border-2 bg-slate-50/50 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 h-12"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Section
            </Button>

          </CardContent>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-xl mt-auto">
            <div className="flex flex-col gap-4">

              {/* Summary Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    <span>{distribution.length} Sections</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{distribution.reduce((acc, r) => acc + r.count, 0)} Questions</span>
                  </div>
                </div>

                <div className={`font-medium ${allocatedMarks === parseInt(examDetails.totalMarks) ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {allocatedMarks} / {examDetails.totalMarks} Marks
                </div>
              </div>

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full shadow-md font-semibold text-base"
                onClick={generateExam}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Question Paper
              </Button>
            </div>
          </div>

        </Card>

      </div>
    </div>
  );
}
