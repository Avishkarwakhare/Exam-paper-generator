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
import { toast } from 'sonner';

const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Biology',
    'English',
    'History',
    'Geography',
    'Economics',
    'Commerce'
];

const QUALIFICATIONS = [
    'B.Ed',
    'M.Ed',
    'Ph.D',
    'B.Sc',
    'M.Sc',
    'B.A',
    'M.A',
    'B.Tech',
    'M.Tech',
    'Other'
];

export function ProfileDialog({ open, onOpenChange, currentUser, onProfileUpdate }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        qualification: '',
        subjects: '',
        bio: '',
        experience: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            // Split name into first and last
            const nameParts = currentUser.name?.split(' ') || ['', ''];
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                phone: currentUser.phone || '',
                qualification: currentUser.qualification || '',
                subjects: currentUser.subjects || '',
                bio: currentUser.bio || '',
                experience: currentUser.experience || ''
            });
        }
    }, [currentUser]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const profileData = {
                name: fullName,
                phone: formData.phone,
                qualification: formData.qualification,
                subjects: formData.subjects,
                bio: formData.bio,
                experience: formData.experience
            };

            const response = await api.put('/auth/profile', profileData);

            if (response.status !== 200) {
                throw new Error('Failed to update profile');
            }

            const data = response.data;
            toast.success('Profile updated successfully!');
            onProfileUpdate?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information and teaching credentials
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    required
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Professional Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="qualification">Highest Qualification</Label>
                            <Select
                                value={formData.qualification}
                                onValueChange={(value) => handleChange('qualification', value)}
                            >
                                <SelectTrigger id="qualification">
                                    <SelectValue placeholder="Select qualification" />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUALIFICATIONS.map(qual => (
                                        <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subjects">Subject Specializations</Label>
                            <Input
                                id="subjects"
                                value={formData.subjects}
                                onChange={(e) => handleChange('subjects', e.target.value)}
                                placeholder="e.g., Mathematics, Physics"
                            />
                            <p className="text-xs text-muted-foreground">
                                Separate multiple subjects with commas
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                                id="experience"
                                type="number"
                                min="0"
                                value={formData.experience}
                                onChange={(e) => handleChange('experience', e.target.value)}
                                placeholder="5"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio / About</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="Tell us about yourself and your teaching philosophy..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
