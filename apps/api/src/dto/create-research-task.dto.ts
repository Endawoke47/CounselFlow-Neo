export interface CreateResearchTaskDto {
  title: string;
  description: string;
  practiceArea?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}
