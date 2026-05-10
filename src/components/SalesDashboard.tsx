import { AnalysisResult } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, TrendingUp, AlertCircle, MessageSquare } from "lucide-react";

export function SalesDashboard({ result }: { result: AnalysisResult }) {
  // Map transcript to graph data. Let's say sentiment is 1 to 10.
  const chartData = result.transcript.map(t => ({
    time: t.timestamp,
    sentiment: t.sentimentScore,
    speaker: t.speaker
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 fade-in">
      
      <header className="mb-8">
         <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Call Intelligence</h1>
         <p className="text-slate-500 mt-2">Analysis complete. Review transcript, sentiment, and coaching feedback.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Transcript */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-medium text-slate-900">Sentiment Over Time</h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-0 overflow-hidden flex flex-col h-[500px]">
             <div className="p-6 border-b border-slate-100 flex items-center gap-2 shrink-0">
               <MessageSquare className="w-5 h-5 text-indigo-500" />
               <h2 className="text-xl font-medium text-slate-900">Diarized Transcript</h2>
             </div>
             <div className="overflow-y-auto p-6 space-y-6 flex-1">
               {result.transcript.map((line, idx) => {
                 const speakerLower = line.speaker.toLowerCase();
                 const isSalesperson = speakerLower.includes("sales") || speakerLower === "speaker a" || speakerLower === "a";
                 return (
                   <div key={idx} className={`flex flex-col ${isSalesperson ? 'items-end' : 'items-start'}`}>
                     <div className="flex items-baseline gap-2 mb-1">
                       <span className="text-sm font-medium text-slate-700">{line.speaker}</span>
                       <span className="text-xs text-slate-400">{line.timestamp}</span>
                     </div>
                     <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${isSalesperson ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                       {line.text}
                     </div>
                   </div>
                 )
               })}
             </div>
          </section>
        </div>

        {/* Right Column: Coaching Card */}
        <div className="space-y-8">
           <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center gap-2 mb-6">
               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               <h2 className="text-xl font-medium text-slate-900">What went well</h2>
             </div>
             <ul className="space-y-4">
               {result.coachingCard.pros.map((pro, idx) => (
                 <li key={idx} className="flex gap-3">
                   <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium">
                     {idx + 1}
                   </div>
                   <p className="text-sm text-slate-700 leading-relaxed">{pro}</p>
                 </li>
               ))}
             </ul>
           </section>

           <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center gap-2 mb-6">
               <AlertCircle className="w-5 h-5 text-rose-500" />
               <h2 className="text-xl font-medium text-slate-900">Missed Opportunities</h2>
             </div>
             <ul className="space-y-4">
               {result.coachingCard.cons.map((con, idx) => (
                 <li key={idx} className="flex gap-3">
                   <div className="shrink-0 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-sm font-medium">
                     {idx + 1}
                   </div>
                   <p className="text-sm text-slate-700 leading-relaxed">{con}</p>
                 </li>
               ))}
             </ul>
           </section>
        </div>
      </div>
    </div>
  );
}
