# Course Comparison Feature

## Overview

The Course Comparison feature enables students to make informed decisions by directly evaluating multiple courses side by side. This feature provides visual metrics, detailed comparisons, and review highlights to help students choose the right courses.

## Features

### 1. Side-by-Side Comparison
- **Compare up to 4 courses simultaneously**
- Comprehensive comparison table showing:
  - Course code and title
  - Department
  - Credits
  - Overall rating with star visualization
  - Difficulty rating with visual badge
  - Workload rating with progress bar
  - Number of reviews

### 2. Visual Metrics
Interactive charts powered by Recharts:
- **Ratings Comparison Bar Chart**: Compare overall rating, difficulty, and workload across all selected courses
- **Multi-Metric Radar Chart**: Visual overview of all metrics in a spider/radar chart format
- **Course Credits Bar Chart**: Compare credit hours across courses

### 3. Review Highlights
Automated analysis of student reviews:
- **Positive Feedback**: Top 3 positive reviews (rating ≥ 4) for each course
- **Areas for Improvement**: Top 3 critical reviews (rating ≤ 2) for each course
- **Recent Reviews**: Latest student reviews with ratings and timestamps
- **Tabbed Interface**: Switch between courses to view their specific review highlights

## User Flow

### Method 1: Direct Comparison Page
1. Navigate to `/courses/compare` from the navbar
2. Click "Add course to compare" button
3. Search and select courses from the dropdown (up to 4)
4. View comparison tables, charts, and review highlights
5. Use "Clear All" to reset selections

### Method 2: From Course List
1. Browse courses at `/courses`
2. Click "Compare" button on any course card
3. Course is added to comparison list (shown in floating button)
4. Add more courses (up to 4)
5. Click the floating "Compare Courses" button
6. Automatically redirected to comparison page with selected courses

### Method 3: Direct URL
Navigate to `/courses/compare?courses=courseId1,courseId2,courseId3`

## Technical Implementation

### Components Created

#### 1. `/src/app/courses/compare/page.tsx`
Main comparison page with:
- URL parameter support for preselecting courses
- Course selection UI
- Conditional rendering based on number of selected courses
- Integration of all comparison components

#### 2. `/src/components/courses/compare/CourseSelector.tsx`
Searchable course selector:
- Command palette-style dropdown
- Real-time search filtering
- Badge display for selected courses
- Remove course functionality
- Maximum 4 courses limit enforcement

#### 3. `/src/components/courses/compare/ComparisonTable.tsx`
Side-by-side comparison table:
- Responsive table with horizontal scroll
- Sticky first column for metric labels
- Color-coded department badges
- Star ratings, difficulty badges, and progress bars
- Hover effects and modern styling

#### 4. `/src/components/courses/compare/ComparisonCharts.tsx`
Visual charts component featuring:
- Bar chart for ratings comparison (recharts)
- Radar chart for multi-metric overview
- Credits comparison bar chart
- Responsive design
- Theme-aware styling

#### 5. `/src/components/courses/compare/ReviewHighlights.tsx`
Review analysis component:
- Fetches reviews from Supabase
- Analyzes sentiment based on ratings
- Categorizes into pros/cons
- Tabbed interface for multiple courses
- Loading states and error handling

#### 6. `/src/components/courses/CompareButton.tsx`
Two subcomponents:
- **CompareButton**: Add/remove course from comparison (on course cards)
- **ComparisonFloatingButton**: Floating action button with sheet/drawer
- Uses localStorage for persistence across page navigation
- Custom event system for state synchronization

### State Management
- **Local Storage**: Persists comparison list across page navigation
- **Custom Events**: `comparison-list-updated` event for cross-component synchronization
- **URL Parameters**: Support for shareable comparison links

### Styling
- Consistent with existing design system
- Uses shadcn/ui components
- Tailwind CSS for styling
- Backdrop blur effects and gradient accents
- Responsive design for mobile, tablet, and desktop

## Files Modified

1. **`/src/app/courses/compare/page.tsx`** - Created comparison page
2. **`/src/components/courses/compare/CourseSelector.tsx`** - Created course selector
3. **`/src/components/courses/compare/ComparisonTable.tsx`** - Created comparison table
4. **`/src/components/courses/compare/ComparisonCharts.tsx`** - Created charts component
5. **`/src/components/courses/compare/ReviewHighlights.tsx`** - Created review highlights
6. **`/src/components/courses/CompareButton.tsx`** - Created compare buttons
7. **`/src/components/courses/ItemCard.tsx`** - Added compare button to course cards
8. **`/src/app/courses/page.tsx`** - Added floating comparison button
9. **`/src/components/layout/Navbar.tsx`** - Added "Compare" link to navbar

## Dependencies Used

- **recharts**: For data visualization (bar charts, radar charts)
- **@radix-ui components**: For UI primitives (dropdown, sheet, tabs, etc.)
- **lucide-react**: For icons
- **next/navigation**: For routing and URL parameters

## Future Enhancements

Potential improvements for the feature:
1. **Export Comparison**: Allow users to export comparison as PDF or image
2. **Save Comparisons**: Save comparison sets to user profile
3. **Share Comparisons**: Generate shareable links with better formatting
4. **More Metrics**: Add GPA distribution, professor ratings, prerequisites
5. **Smart Recommendations**: Suggest similar courses based on selection
6. **Comparison History**: Track previously compared courses
7. **Print Optimization**: Better print styling for comparison tables

## Usage Examples

### Example 1: Compare Two Math Courses
```
/courses/compare?courses=MAL401,MAL402
```

### Example 2: Compare CS Courses
1. Go to /courses
2. Click "Compare" on CS101
3. Click "Compare" on CS201
4. Click floating "Compare Courses" button
5. View detailed comparison

## Performance Considerations

- **Lazy Loading**: Reviews are fetched only when comparison page is opened
- **Optimistic Updates**: UI updates immediately when adding/removing courses
- **Memoization**: Charts data is memoized to prevent unnecessary recalculations
- **Pagination**: Review highlights limited to top 10 reviews per course

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support (via Radix UI)
- Color contrast compliance
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- LocalStorage support required for comparison persistence

---

**Created**: January 2026
**Version**: 1.0.0
**Author**: GitHub Copilot
