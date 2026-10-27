import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            Sri Lanka Gov Job Tracker
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the latest government vacancies, examinations, and results extracted directly from the official Gazette.
          </p>
        </header>

        <Dashboard />
      </div>
    </main>
  );
}
