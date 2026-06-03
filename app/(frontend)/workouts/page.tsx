import React from 'react'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { ChevronRight, Dumbbell, Activity, Heart, Trophy, Clock, Target, ArrowRight } from 'lucide-react'

interface WorkoutPlan {
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  target: string
  categorySlug: string
  description: string
  steps: string[]
  equipment: string
}

const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    title: 'Full-Body Strength Progression',
    difficulty: 'Intermediate',
    duration: '45 Mins',
    target: 'Hypertrophy & Power',
    categorySlug: 'strength-training',
    description: 'A structured resistance training routine using dumbbells and weight benches to build overall lean muscle.',
    steps: [
      'Warm-up: 5 mins dynamic stretches',
      'Dumbbell Goblet Squats: 3 sets of 10 reps',
      'Incline Dumbbell Bench Press: 3 sets of 8 reps',
      'One-Arm Dumbbell Rows: 3 sets of 10 reps per side',
      'Dumbbell Roman Chair Back Extensions or Deadlifts: 3 sets of 12 reps',
      'Cooldown: 5 mins static full-body stretch'
    ],
    equipment: 'Dumbbells & Adjustable Bench'
  },
  {
    title: 'HIIT Cardio Stamina Burner',
    difficulty: 'Advanced',
    duration: '30 Mins',
    target: 'Cardiovascular Endurance',
    categorySlug: 'cardio-machines',
    description: 'High-intensity interval protocol designed for treadmills and stationary spin bikes to spike metabolic rate.',
    steps: [
      'Warm-up: 5 mins light jog or spin',
      'Sprint Interval: 30 secs maximum effort sprint',
      'Recovery Interval: 90 secs slow jog or light spin',
      'Repeat sprints and recovery intervals 8 times',
      'Steady State Zone: 5 mins moderate aerobic pace',
      'Cooldown: 3 mins walking speed recovery'
    ],
    equipment: 'Treadmill or Spin Bike'
  },
  {
    title: 'Mind-Body Vinyasa Flow',
    difficulty: 'Beginner',
    duration: '40 Mins',
    target: 'Flexibility & Core Stability',
    categorySlug: 'yoga-and-pilates',
    description: 'A fluid sequence linking breath with movement to release joint tension and strengthen key postural muscles.',
    steps: [
      'Child\'s Pose & Box Breathing: 5 mins alignment focus',
      'Sun Salutations (Surya Namaskar A): 5 cycles',
      'Warrior II to Peaceful Warrior: hold 5 breaths each side',
      'Balance Sequence: Tree Pose & Eagle Pose',
      'Core focus: Boat Pose (Navasana) hold 30 secs',
      'Savasana: 5 mins final resting state'
    ],
    equipment: 'Premium Yoga Mat'
  },
  {
    title: 'Heavy Bag Speed & Power Drill',
    difficulty: 'Intermediate',
    duration: '35 Mins',
    target: 'Agility & Upper Body Power',
    categorySlug: 'boxing-and-mma',
    description: 'Boxing conditioning drills to improve punch mechanics, rotational core speed, and athletic conditioning.',
    steps: [
      'Jump Rope warm-up: 3 rounds of 3 mins',
      'Shadow Boxing: 1 round focusing on double jab + cross combo',
      'Heavy Bag Drills: 3-punch combo repetitions (Jab-Cross-Hook)',
      'Pyramid punch speed drills: 10 secs fast, 10 secs slow (repeat)',
      'Bodyweight core burner: 3 sets of 15 sit-ups',
      'Cooldown: Shoulder and wrist mobility rotation stretches'
    ],
    equipment: 'Boxing Gloves & Hand Wraps'
  }
]

export default function WorkoutsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Workouts Header Banner */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 sm:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[#128a88] font-bold">Workout Routines</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2.5 flex-shrink-0">
              <img 
                src="/faviconskyfit.png" 
                alt="SkyFit Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#128a88] bg-[#128a88]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Trophy size={10} />
                  Guides
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c1222]">
                Active Workout Programs
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Ready-to-use routines curated by expert fitness coaches. Get the best out of your SkyFit equipment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Grid */}
      <div className="flex-1 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WORKOUT_PLANS.map((plan, i) => (
              <div 
                key={i} 
                className="border border-gray-100 rounded-3xl p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 uppercase">
                      {plan.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                      <Clock size={13} />
                      {plan.duration}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                      <Target size={13} />
                      {plan.target}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">{plan.description}</p>

                  {/* Routine steps */}
                  <div className="bg-gray-50/50 border border-gray-100/50 rounded-2xl p-4 sm:p-5 mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Routine Steps</span>
                    <ol className="space-y-2.5">
                      {plan.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-xs sm:text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#128a88]">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Footer Equipment CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Equipment Needed</span>
                    <span className="text-xs font-bold text-gray-700">{plan.equipment}</span>
                  </div>
                  <Link
                    href={`/category/${plan.categorySlug}`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-full bg-[#1a1a1a] text-white text-xs font-bold hover:bg-[#128a88] transition-colors"
                  >
                    <span>Shop Gear</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
