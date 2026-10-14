'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LessonListItem {
  id: number;
  title: string;
  slug: string;
  step_number?: number;
}

interface SeriesProgress {
  id: number;
  name: string;
  slug: string;
  description: string;
  topic_name: string;
  topic_slug: string;
  total_lessons_count: number;
  completed_lessons_count: number;
  progress_percentage: number;
  next_lesson_slug: string | null;
  lessons: LessonListItem[];
}

export default function ProgressDashboardPage() {
  const [courses, setCourses] = useState<SeriesProgress[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Obtenemos solo los cursos iniciados por el usuario
      const res = await fetch(`${API_URL}/series/?my_courses=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }

      // Fetch completed lessons for the syllabus checkmarks
      if (token) {
        const progRes = await fetch(`${API_URL}/progress/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (progRes.ok) {
          const progData = await progRes.json();
          setCompletedLessonIds(progData.map((p: any) => p.lesson));
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeries = (id: number) => {
    setExpandedSeriesIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3">
          <span className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full"></span>
          <span className="text-cyan-500 font-mono text-sm">Loading your progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Progress</h1>
        <p className="text-slate-400">Continue learning where you left off.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-xl font-medium text-slate-300 mb-2">You haven't started any courses yet</h2>
          <p className="text-slate-500 mb-6">Explore our topics and start learning today.</p>
          <Link href="/topics" className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-6 rounded-md transition-colors">
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-slate-600 transition-colors flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-1 block">
                    {course.topic_name}
                  </span>
                  <h3 className="text-xl font-bold text-slate-200">
                    {course.name}
                  </h3>
                </div>
                <div className="bg-slate-900 rounded-full h-12 w-12 flex items-center justify-center border border-slate-700 flex-shrink-0">
                  <span className="font-bold text-sm text-emerald-400">{course.progress_percentage}%</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col mb-6">
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Collapsible Syllabus */}
                <div className="mt-auto pt-2">
                  <button
                    onClick={() => toggleSeries(course.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  >
                    <svg 
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSeriesIds[course.id] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>{expandedSeriesIds[course.id] ? 'Hide Syllabus' : 'View Syllabus'} ({course.lessons?.length || 0} lessons)</span>
                  </button>

                  {expandedSeriesIds[course.id] && (
                    <div className="mt-3 bg-slate-900/40 rounded-lg p-3 border border-slate-800/80 max-h-48 overflow-y-auto flex flex-col gap-2">
                      {course.lessons && course.lessons.length > 0 ? (
                        [...course.lessons]
                          .sort((a, b) => (a.step_number || a.id) - (b.step_number || b.id))
                          .map((lesson, idx) => {
                            const isCompleted = completedLessonIds.includes(lesson.id);
                            return (
                              <div key={lesson.id} className="flex items-center justify-between text-xs gap-3">
                                <Link
                                  href={`/topics/${course.topic_slug}/${course.slug}/${lesson.slug}`}
                                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors truncate flex-1 py-0.5"
                                >
                                  <span className="font-mono text-[10px] text-slate-600">
                                    {(idx + 1).toString().padStart(2, '0')}
                                  </span>
                                  <span className="truncate">{lesson.title}</span>
                                </Link>
                                {isCompleted ? (
                                  <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-1.5 flex-shrink-0" />
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-xs text-slate-500 italic">No lessons in this course yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                  <span>Progress</span>
                  <span>{course.completed_lessons_count} of {course.total_lessons_count} completed</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${course.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              {course.progress_percentage === 100 ? (
                <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium rounded-md text-center">
                  🎉 Course Completed!
                </div>
              ) : (
                course.next_lesson_slug ? (
                  <Link 
                    href={`/topics/${course.topic_slug}/${course.slug}/${course.next_lesson_slug}`} 
                    className="w-full block text-center py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md transition-colors"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <Link 
                    href={`/topics/${course.topic_slug}/${course.slug}`} 
                    className="w-full block text-center py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors"
                  >
                    View Content
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
