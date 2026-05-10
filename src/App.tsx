/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { UploadCloud, Loader2, FileAudio } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";
import { SalesDashboard } from "./components/SalesDashboard";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const processAudio = async () => {
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Read file as base64
      const buffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              {
                text: "You are an expert sales coach. Analyze this sales call audio. Provide a diarized transcript, sentiment score (1-10) for engagement/positivity at each exchange, and a coaching card with exactly 3 things the salesperson did well (pros) and 3 missed opportunities (cons). Identify Speaker A as Salesperson and Speaker B as Prospect if possible, or just use Speaker A / Speaker B."
              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type || "audio/mp3",
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: {
                type: Type.ARRAY,
                description: "Diarized transcript of the sales call",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING, description: "Speaker A or Speaker B" },
                    text: { type: Type.STRING },
                    timestamp: { type: Type.STRING, description: "MM:SS format" },
                    sentimentScore: { type: Type.NUMBER, description: "Sentiment score from 1 to 10" }
                  },
                  required: ["speaker", "text", "timestamp", "sentimentScore"]
                }
              },
              coachingCard: {
                type: Type.OBJECT,
                properties: {
                  pros: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 things the salesperson did well"
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 missed opportunities or areas for improvement"
                  }
                },
                required: ["pros", "cons"]
              }
            },
            required: ["transcript", "coachingCard"]
          }
        }
      });

      if (response.text) {
        const parsedResult = JSON.parse(response.text) as AnalysisResult;
        setResult(parsedResult);
      } else {
        throw new Error("No response from AI");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis. Try a smaller file or check your console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 relative pb-12">
        <button 
          onClick={() => { setResult(null); setFile(null); }}
          className="absolute top-4 right-4 md:top-8 md:right-8 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Analyze Another Call
        </button>
        <SalesDashboard result={result} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 md:p-12 text-center fade-in">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
          Upload Sales Call
        </h1>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          Upload an audio recording of your sales call to generate a transcript, sentiment analysis, and AI coaching feedback.
        </p>

        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 mb-6 transition-all duration-200 
            ${isAnalyzing ? 'opacity-50 cursor-not-allowed border-slate-200' : 'cursor-pointer hover:border-indigo-400 hover:bg-slate-50'}
            ${file ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-300'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="audio/*" 
            className="hidden" 
          />
          
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <FileAudio className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="text-sm font-medium text-slate-700">{file.name}</div>
              <div className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-600">
              Click to browse or drag and drop audio file
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium text-left">
            {error}
          </div>
        )}

        <button 
          onClick={processAudio}
          disabled={!file || isAnalyzing}
          className="w-full py-4 px-6 rounded-xl font-medium text-white shadow-lg shadow-indigo-500/20 transition-all
            disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed
            bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] flex justify-center items-center gap-3"
        >
          {isAnalyzing ? (
             <>
               <Loader2 className="w-5 h-5 animate-spin" />
               Analyzing Call...
             </>
          ) : (
             'Generate Coaching Report'
          )}
        </button>
      </div>
    </div>
  );
}
