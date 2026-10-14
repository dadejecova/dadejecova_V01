export default function DashboardPage() {
  return (
    <div className="p-10 h-full flex flex-col justify-center items-center text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-light text-white mb-6">
          Welcome to the <span className="font-bold text-cyan-400">Control Panel</span>
        </h1>
        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
          Select an option from the left sidebar to start managing 
          your classes, lessons, or update your public CV and project information.
        </p>
        <div className="flex gap-4 justify-center">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-2xl mb-2">👨‍🏫</div>
            <div className="text-sm font-medium text-slate-300">Courses</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-slate-300">Lessons</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-2xl mb-2">💼</div>
            <div className="text-sm font-medium text-slate-300">Curriculum</div>
          </div>
        </div>
      </div>
    </div>
  );
}