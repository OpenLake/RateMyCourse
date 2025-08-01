import { DepartmentProperties } from "@/types";
import {
    Calculator,
    Car,
    Radio,
    Code,
    BookOpen,
    BrainCog,
    Cog,
    Bot,
    FlaskConical,
    Zap,
    Dna,
    Atom,
    AlignJustify,
    Microscope,
    ChartScatter
  } from "lucide-react";
  

  const departmentProperties: DepartmentProperties[] = [
    {
      id: 'MA',
      name: 'Mathematics',
      color: '#FF5733',
      icon: Calculator,
    },
    {
      id: 'EVT',
      name: 'Electric Vehicle Technology',
      color: '#33FF57',
      icon: Car,
    },
    {
      id: 'ECE',
      name: 'Electronics and Communication Engineering',
      color: '#3357FF',
      icon: Radio,
    },
    {
      id: 'CSE',
      name: 'Computer Science and Engineering',
      color: '#FF33A1',
      icon: Code,
    },
    {
      id: 'LA',
      name: 'Liberal Arts',
      color: '#8E44AD',
      icon: BookOpen,
    },
    {
      id: 'DSAI',
      name: 'Data Science and Artificial Intelligence',
      color: '#1ABC9C',
      icon: ChartScatter,
    },
    {
      id: 'ME',
      name: 'Mechanical Engineering',
      color: '#E67E22',
      icon: Cog,
    },
    {
      id: 'MT',
      name: 'Mechatronics Engineering',
      color: '#D35400',
      icon: Bot,
    },
    {
      id: 'MSME',
      name: 'Materials Science and Metallurgical Engineering',
      color: '#2C3E50',
      icon: Microscope,
    },
    {
      id: 'CH',
      name: 'Chemistry',
      color: '#3498DB',
      icon: FlaskConical,
    },
    {
      id: 'EE',
      name: 'Electrical Engineering',
      color: '#F1C40F',
      icon: Zap,
    },
    {
      id: 'BSBME',
      name: 'Bioscience and Biomedical Engineering',
      color: '#16A085',
      icon: Dna,
    },
    {
      id: 'PH',
      name: 'Physics',
      color: '#9B59B6',
      icon: Atom,
    },
  ];
  
export default departmentProperties;