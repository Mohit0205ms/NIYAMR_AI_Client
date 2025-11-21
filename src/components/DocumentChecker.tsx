"use client";

import axios from "axios";
import { useState } from "react";

export default function DocumentChecker() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [rules, setRules] = useState(["", "", ""]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      console.log("pdf: ", event.target.files[0]);
      setPdfFile(event.target.files[0]);
      setPdfFileName(event.target.files[0].name);
    }
  };

  const handleCheckDocument = async() => {
    setIsLoading(true);
    try {
      if (!pdfFile) {
        alert('pleese select some pdf file to uplaod');
        return;
      }
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("rules", JSON.stringify(rules));

      const res = await axios.post('http://localhost:4000/api/evaluate-pdf', formData);
      console.log("resultt: ", res.data.data);
      if (!Array.isArray(res?.data?.data)) {
        throw new Error('Invalid server response: expected array');
      }
      setResults(res.data?.data);
    }catch(err) {
      console.log(`${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-blue-50 via-white to-indigo-100 p-10 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-indigo-800">NIYAMR AI - PDF Checker</h1>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2 text-gray-700">Upload PDF File</label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
              <input id="file-upload" type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
            </label>
          </div>
          {pdfFileName && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-600 font-medium">Selected file: {pdfFileName}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Define Rules</h2>
          {rules.map((rule, i) => (
            <input
              key={i}
              value={rule}
              onChange={(e) =>
                setRules(rules.map((r, idx) => (idx === i ? e.target.value : r)))
              }
              placeholder={`Rule ${i + 1}`}
              className="mb-4 border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition text-black"
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <button
            onClick={handleCheckDocument}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Check Document'
            )}
          </button>
        </div>

        {results.length > 0 && (
          <table className="w-full mt-6 table-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Rule</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Evidence</th>
                <th className="px-6 py-4 text-left">Reasoning</th>
                <th className="px-6 py-4 text-left">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {results?.map((r: any, i) => (
                <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition`}>
                  <td className="px-6 py-4 text-gray-900 font-medium">{r.rule}</td>
                  <td className={`px-6 py-4 font-semibold ${r.status?.toLowerCase() === 'pass' ? 'text-green-600' : r.status?.toLowerCase() === 'fail' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {r.status}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{r.evidence}</td>
                  <td className="px-6 py-4 text-gray-700">{r.reasoning}</td>
                  <td className="px-6 py-4 text-gray-700">{r.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
