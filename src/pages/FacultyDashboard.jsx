import React, { useState, useEffect } from 'react';
import { GraduationCap, FolderOpen, Brain, Clock, CheckCircle, XCircle, Users, Menu, X, LogOut, FileText, AlertCircle, ChevronRight, Folder, File, Code, Image as ImageIcon, Download, ArrowLeft, ThumbsUp, ThumbsDown, Percent, Star, TrendingUp, TrendingDown, Award, FileCode, Shield, Zap, BookOpen,FileDown } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const AI_ANALYSIS_URL = process.env.REACT_APP_AI_SERVICE_URL_REVIEW || 'http://localhost:8000';

// Enhanced AI Analysis Modal Component
// Enhanced AI Analysis Modal Component with PDF Download
const AIAnalysisModal = ({ projectId, projectPath, projectName, studentDescription, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
  try {
    setAnalyzing(true);
    setError('');
    
    const token = localStorage.getItem('authToken');
    
    // CHANGE: Backend ko call karo with LONGER timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout
    
    const response = await fetch(
      `${API_BASE_URL}/faculty/dashboard/project/${projectId}/ai-analysis`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      setAnalysisResult(result);
    } else {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        setError('Analysis failed: ' + (errorJson.error || errorText));
      } catch {
        setError('Analysis failed: ' + errorText);
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      setError('Analysis is taking longer than expected. The AI service might be waking up. Please try again in 1-2 minutes.');
    } else {
      setError('Error running analysis: ' + err.message);
    }
  } finally {
    setAnalyzing(false);
  }
};
  
  useEffect(() => {
    runAnalysis();
  }, []);

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Project Analysis Report - ${analysisResult.project_name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 28px;
            color: #1e293b;
            margin-bottom: 8px;
          }
          .header p {
            color: #64748b;
            font-size: 14px;
          }
          .overview-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .overview-card {
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .overview-card.grade {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
          }
          .overview-card.grade.b-grade {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          }
          .overview-card.grade.c-grade {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }
          .overview-card.grade.d-grade {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          }
          .overview-card.grade.f-grade {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }
          .overview-card .label {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .overview-card .value {
            font-size: 36px;
            font-weight: 700;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-item {
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
          }
          .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 14px;
            color: #1e293b;
          }
          .tech-category {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .tech-category-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
            text-transform: capitalize;
          }
          .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .tech-tag {
            display: inline-block;
            padding: 6px 12px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .analysis-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .analysis-item {
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .analysis-item h4 {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
            text-transform: capitalize;
          }
          .analysis-item p {
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
          }
          .list-section {
            margin-bottom: 25px;
            padding: 20px;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .list-section.strengths {
            background: #f0fdf4;
            border: 2px solid #10b981;
          }
          .list-section.weaknesses {
            background: #fef2f2;
            border: 2px solid #ef4444;
          }
          .list-section.recommendations {
            background: #eff6ff;
            border: 2px solid #3b82f6;
          }
          .list-section h3 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .list-section.strengths h3 {
            color: #059669;
          }
          .list-section.weaknesses h3 {
            color: #dc2626;
          }
          .list-section.recommendations h3 {
            color: #2563eb;
          }
          .list-item {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            align-items: flex-start;
          }
          .list-number {
            min-width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            color: white;
          }
          .strengths .list-number {
            background: #059669;
          }
          .weaknesses .list-number {
            background: #dc2626;
          }
          .recommendations .list-number {
            background: #2563eb;
          }
          .list-text {
            flex: 1;
            font-size: 13px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 20px;
            }
            .overview-grid {
              page-break-inside: avoid;
            }
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Project Analysis Report</h1>
          <p>Comprehensive Code Review and Assessment</p>
          <p style="margin-top: 10px; font-size: 12px;">Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="overview-grid">
          ${analysisResult.overall_grade ? `
            <div class="overview-card grade ${
              analysisResult.overall_grade.startsWith('B') ? 'b-grade' :
              analysisResult.overall_grade.startsWith('C') ? 'c-grade' :
              analysisResult.overall_grade.startsWith('D') ? 'd-grade' :
              analysisResult.overall_grade.startsWith('F') ? 'f-grade' : ''
            }">
              <div class="label">Overall Grade</div>
              <div class="value">${analysisResult.overall_grade}</div>
            </div>
          ` : ''}
          
          ${analysisResult.code_quality_score !== undefined ? `
            <div class="overview-card">
              <div class="label">Quality Score</div>
              <div class="value" style="color: ${
                analysisResult.code_quality_score >= 90 ? '#059669' :
                analysisResult.code_quality_score >= 80 ? '#2563eb' :
                analysisResult.code_quality_score >= 70 ? '#d97706' :
                analysisResult.code_quality_score >= 60 ? '#ea580c' : '#dc2626'
              }">${analysisResult.code_quality_score.toFixed(1)}</div>
            </div>
          ` : ''}
          
          ${analysisResult.detected_tech_stack ? `
            <div class="overview-card">
              <div class="label">Technologies</div>
              <div class="value" style="color: #059669">${Object.values(analysisResult.detected_tech_stack).flat().length}</div>
            </div>
          ` : ''}
        </div>

        <div class="section">
          <h2 class="section-title">Project Overview</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Project Name</div>
              <div class="info-value">${analysisResult.project_name || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Description</div>
              <div class="info-value">${analysisResult.student_description || 'N/A'}</div>
            </div>
          </div>
        </div>

        ${analysisResult.detected_tech_stack && Object.keys(analysisResult.detected_tech_stack).length > 0 ? `
          <div class="section">
            <h2 class="section-title">Technology Stack</h2>
            ${Object.entries(analysisResult.detected_tech_stack).map(([category, technologies]) => 
              technologies.length > 0 ? `
                <div class="tech-category">
                  <div class="tech-category-title">${category.replace(/_/g, ' ')} (${technologies.length})</div>
                  <div class="tech-tags">
                    ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                  </div>
                </div>
              ` : ''
            ).join('')}
          </div>
        ` : ''}

        ${analysisResult.detailed_analysis ? `
          <div class="section">
            <h2 class="section-title">Detailed Analysis</h2>
            <div class="analysis-grid">
              ${Object.entries(analysisResult.detailed_analysis).map(([key, value]) => `
                <div class="analysis-item">
                  <h4>${key.replace(/_/g, ' ')}</h4>
                  <p>${value}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${analysisResult.strengths && analysisResult.strengths.length > 0 ? `
          <div class="list-section strengths">
            <h3>Strengths</h3>
            ${analysisResult.strengths.map((strength, idx) => `
              <div class="list-item">
                <div class="list-number">${idx + 1}</div>
                <div class="list-text">${strength}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${analysisResult.weaknesses && analysisResult.weaknesses.length > 0 ? `
          <div class="list-section weaknesses">
            <h3>Areas for Improvement</h3>
            ${analysisResult.weaknesses.map((weakness, idx) => `
              <div class="list-item">
                <div class="list-number">${idx + 1}</div>
                <div class="list-text">${weakness}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${analysisResult.recommendations && analysisResult.recommendations.length > 0 ? `
          <div class="list-section recommendations">
            <h3>Recommendations</h3>
            ${analysisResult.recommendations.map((recommendation, idx) => `
              <div class="list-item">
                <div class="list-number">${idx + 1}</div>
                <div class="list-text">${recommendation}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p><strong>AI Project Analysis Report</strong></p>
          <p>This report was automatically generated using AI-powered code analysis</p>
          <p style="margin-top: 8px;">© ${new Date().getFullYear()} Project Review System</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">AI Project Analysis</h2>
                <p className="text-sm text-slate-500">Comprehensive code review and assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {analysisResult && !analyzing && (
                <button
                  onClick={generatePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
              )}
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Loading State */}
          {analyzing && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
              <p className="text-slate-600 mt-4 font-medium">Analyzing project with AI...</p>
              <p className="text-slate-500 text-sm mt-2">This may take a moment</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Results */}
          {analysisResult && !analyzing && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Grade Card */}
                {analysisResult.overall_grade && (
                  <div className={`${getGradeColor(analysisResult.overall_grade)} rounded-xl p-6 border-2`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold uppercase tracking-wide">Overall Grade</span>
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-4xl font-bold">{analysisResult.overall_grade}</div>
                  </div>
                )}

                {/* Score Card */}
                {analysisResult.code_quality_score !== undefined && (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Quality Score</span>
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(analysisResult.code_quality_score)}`}>
                      {analysisResult.code_quality_score.toFixed(1)}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${analysisResult.code_quality_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tech Stack Count */}
                {analysisResult.detected_tech_stack && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Technologies</span>
                      <FileCode className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-4xl font-bold text-emerald-900">
                      {Object.values(analysisResult.detected_tech_stack).flat().length}
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">Detected</p>
                  </div>
                )}
              </div>

              {/* Project Overview */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Project Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Project Name</p>
                    <p className="text-slate-900">{analysisResult.project_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Description</p>
                    <p className="text-slate-900">{analysisResult.student_description}</p>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  Detected Technology Stack
                </h3>
                {analysisResult.detected_tech_stack && Object.keys(analysisResult.detected_tech_stack).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(analysisResult.detected_tech_stack).map(([category, technologies]) => (
                      technologies.length > 0 && (
                        <div key={category} className="border border-slate-100 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 mb-2 capitalize flex items-center gap-2">
                            {category.replace(/_/g, ' ')}
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {technologies.length}
                            </span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {technologies.map((tech, idx) => (
                              <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No technology stack detected</p>
                  </div>
                )}
              </div>

              {/* Detailed Analysis */}
              {analysisResult.detailed_analysis && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Detailed Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysisResult.detailed_analysis).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-2 capitalize flex items-center gap-2">
                          {key === 'code_structure' && <FileCode className="w-4 h-4 text-blue-600" />}
                          {key === 'security' && <Shield className="w-4 h-4 text-red-600" />}
                          {key === 'performance' && <Zap className="w-4 h-4 text-yellow-600" />}
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                  <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-emerald-900 leading-relaxed">{strength}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {analysisResult.weaknesses && analysisResult.weaknesses.length > 0 && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-red-900 leading-relaxed">{weakness}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed">{recommendation}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// File Viewer Component for Faculty
const FacultyFileViewer = ({ projectId, onBack, onStatusUpdate }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [decision, setDecision] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    fetchFiles(currentPath);
    setSelectedFile(null);
    setFileContent('');
  }, [currentPath, projectId]);

  const fetchFiles = async (path) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      const url = `${API_BASE_URL}/faculty/dashboard/project/${projectId}/files${path ? `?path=${encodeURIComponent(path)}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        setError('');
      } else {
        const errorText = await response.text();
        setError('Failed to load files: ' + errorText);
      }
    } catch (err) {
      setError('Error loading files: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/faculty/dashboard/project/${projectId}/details`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setProjectDetails(data);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchFileContent = async (filePath) => {
    try {
      setLoadingContent(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/faculty/dashboard/project/${projectId}/file/content?path=${encodeURIComponent(filePath)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const content = await response.text();
        setFileContent(content);
      } else {
        const errorText = await response.text();
        setFileContent('Error loading file content: ' + errorText);
      }
    } catch (err) {
      setFileContent('Error loading file content: ' + err.message);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }
    
    const isDir = selectedFile.isDirectory === true || selectedFile.directory === true;
    
    if (isDir) {
      setError('Cannot download folders. Please select a file instead.');
      setSelectedFile(null);
      return;
    }
    
    try {
      setDownloading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/faculty/dashboard/project/${projectId}/file/download?path=${encodeURIComponent(selectedFile.path)}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = selectedFile.name;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (err) {
      const errorMessage = err.message.replace('Error: ', '');
      setError(`Failed to download: ${errorMessage}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleFileClick = (file) => {
    const isDir = Boolean(file.isDirectory || file.directory);
    
    if (isDir) {
      setCurrentPath(file.path);
      setSelectedFile(null);
      setFileContent('');
      setError('');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    if (isTextFile(file.name)) {
      fetchFileContent(file.path);
    } else {
      setFileContent('');
    }
  };

  const handleBack = () => {
    if (selectedFile) {
      setSelectedFile(null);
      setFileContent('');
    } else if (currentPath) {
      const lastSlashIndex = currentPath.lastIndexOf('/');
      const parentPath = lastSlashIndex > 0 ? currentPath.substring(0, lastSlashIndex) : '';
      setCurrentPath(parentPath);
    } else {
      onBack();
    }
  };

  const handleDecision = async (accept) => {
    setDecision(accept);
    setShowDecisionModal(true);
  };

  const submitDecision = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/faculty/dashboard/project/${projectId}/decision?accept=${decision}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const message = await response.text();
        alert(message);
        setShowDecisionModal(false);
        onStatusUpdate();
        onBack();
      } else {
        const errorText = await response.text();
        alert('Error: ' + errorText);
      }
    } catch (err) {
      alert('Error submitting decision: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgressUpdate = async () => {
    if (progress < 0 || progress > 100) {
      alert('Progress must be between 0 and 100');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_BASE_URL}/faculty/dashboard/project/${projectId}/progress`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ progress: parseInt(progress) })
        }
      );

      if (response.ok) {
        const message = await response.text();
        alert(message);
        setShowProgressModal(false);
        onStatusUpdate();
      } else {
        const errorText = await response.text();
        alert('Error: ' + errorText);
      }
    } catch (err) {
      alert('Error updating progress: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getFileIcon = (fileName, isDirectory) => {
    const isDir = isDirectory === true || isDirectory?.directory === true;
    
    if (isDir) return <Folder className="w-5 h-5 text-blue-500" />;
    
    const ext = fileName.split('.').pop().toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx', 'java', 'py', 'cpp', 'c', 'html', 'css', 'go', 'rs', 'php'].includes(ext)) {
      return <Code className="w-5 h-5 text-green-500" />;
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const isTextFile = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const textExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'java', 'py', 'cpp', 'c', 'h', 'hpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'r',
      'html', 'htm', 'css', 'scss', 'sass', 'less', 'vue',
      'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
      'md', 'markdown', 'txt', 'rst', 'adoc', 'tex', 'latex', 'bib',
      'sh', 'bash', 'zsh', 'bat', 'ps1', 'cmd',
      'sql', 'graphql', 'prisma',
      'gradle', 'maven', 'dockerfile', 'makefile',
      'log', 'csv', 'tsv', 'properties', 'env', 'gitignore', 'gitattributes', 'editorconfig',
      'jsp', 'jspx', 'tag', 'tld'
    ];
    return textExtensions.includes(ext);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Requests</span>
        </button>
        <div className="text-sm text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded">
          /{currentPath || 'root'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
  <div className="flex items-center gap-3 flex-wrap">
    <button
      onClick={() => setShowAnalysis(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
    >
      <Brain className="w-4 h-4" />
      AI Analysis
    </button>
    <button
      onClick={() => handleDecision(true)}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
    >
      <ThumbsUp className="w-4 h-4" />
      Accept Project
    </button>
    <button
      onClick={() => handleDecision(false)}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      <ThumbsDown className="w-4 h-4" />
      Reject Project
    </button>
    <button
      onClick={() => setShowProgressModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Percent className="w-4 h-4" />
      Update Progress
    </button>
  </div>
</div>




      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Files & Folders
          </h3>
          <div className="space-y-2">
            {files.map((file, idx) => {
              const isDir = file.isDirectory === true || file.directory === true;
              return (
                <button
                  key={idx}
                  onClick={() => handleFileClick(file)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left ${
                    selectedFile?.path === file.path && !isDir ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                  }`}
                >
                  {getFileIcon(file.name, isDir)}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    {!isDir && <div className="text-xs text-slate-500">{file.size}</div>}
                  </div>
                  {isDir && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
              );
            })}
            {files.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Folder className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No files found</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          {selectedFile && !selectedFile.isDirectory ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.name, false)}
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-500">{selectedFile.size}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-[500px] overflow-auto">
                {loadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : isTextFile(selectedFile.name) ? (
                  <pre className="text-sm bg-slate-50 p-4 rounded-lg overflow-x-auto font-mono">
                    <code>{fileContent}</code>
                  </pre>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <File className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Preview not available</p>
                    <p className="text-sm mt-2">This file type cannot be previewed in the browser</p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download to view
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-slate-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-lg">Select a file to preview</p>
                <p className="text-sm mt-2">Click on any file from the left panel</p>
                <p className="text-xs mt-4 text-slate-400">Folders will open automatically when clicked</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Confirm {decision ? 'Acceptance' : 'Rejection'}
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to {decision ? 'accept' : 'reject'} this project?
              {decision ? ' This will mark the project as accepted.' : ' This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDecisionModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  decision ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Update Project Progress</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Progress Percentage (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter progress percentage"
              />
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">{progress}% Complete</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProgressModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleProgressUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAnalysis && projectDetails && (
  <AIAnalysisModal
    projectId={projectId}
    projectPath={projectDetails.projectPath || '/path/to/project'}
    projectName={projectDetails.title || 'Project'}
    studentDescription={projectDetails.description || ''}
    onClose={() => setShowAnalysis(false)}
  />
)}
    </div>
  );
};

// Main Faculty Dashboard
const FacultyDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [facultyData, setFacultyData] = useState(null);
  const [viewingProjectId, setViewingProjectId] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [requests, setRequests] = useState([]);

  const getInitials = (name) => {
    if (!name) return 'F';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAuthToken = () => localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const profileResponse = await fetch(`${API_BASE_URL}/faculty/dashboard/profile`, {
        method: 'GET',
        headers: headers
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setFacultyData({
          name: profile.facultyName || 'Faculty',
          email: profile.email || '',
          department: profile.department || 'Department',
          initials: getInitials(profile.facultyName || 'Faculty')
        });
      }

      const summaryResponse = await fetch(`${API_BASE_URL}/faculty/dashboard/summary`, {
        method: 'GET',
        headers: headers
      });

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        setDashboardSummary(summary);
      }

      await fetchRequests();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.message?.includes('401')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE_URL}/faculty/dashboard/requests`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'FACULTY_ACCEPTED': 'bg-emerald-100 text-emerald-700',
      'FACULTY_REQUESTED': 'bg-purple-100 text-purple-700',
      'APPROVED': 'bg-blue-100 text-blue-700',
      'REJECTED': 'bg-red-100 text-red-700',
      'PENDING': 'bg-amber-100 text-amber-700'
    };
    return statusMap[status] || 'bg-slate-100 text-slate-700';
  };

  const StatCard = ({ icon: Icon, count, label, subtitle, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{count}</div>
      <div className="text-sm font-semibold text-slate-900 mb-1">{label}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );

  const ProjectRequestCard = ({ project }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-slate-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-slate-900 text-white w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0">
            {project.title?.substring(0, 2).toUpperCase() || 'PR'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">{project.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status?.replace('_', ' ')}
        </span>
        <span className="text-sm text-slate-500">Submitted: {formatDate(project.submittedAt)}</span>
        {project.createdBy?.studentName && (
          <span className="text-sm text-slate-500">Student: {project.createdBy.studentName}</span>
        )}
      </div>

      {project.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">College: {project.college}</span>
        <button 
          onClick={() => setViewingProjectId(project.projectId)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Review Project <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 rounded-xl p-2">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900">Faculty Portal</h1>
            <p className="text-xs text-slate-500">Project Review System</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 mb-2">YOUR ROLE</div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="font-semibold text-slate-900">Faculty</div>
            <div className="text-xs text-slate-600 mt-1">{facultyData?.department || 'Loading...'}</div>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {[
          { id: 'dashboard', icon: FolderOpen, label: 'Dashboard' },
          { id: 'requests', icon: Clock, label: 'Pending Requests' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === 'requests') fetchRequests();
              if (item.id === 'dashboard') fetchDashboardData();
              setSidebarOpen(false);
              setViewingProjectId(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
            {facultyData?.initials || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900 truncate">{facultyData?.name || 'Loading...'}</div>
            <div className="text-xs text-slate-500 truncate">{facultyData?.email || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="lg:ml-64 p-6 lg:p-8 pt-20 lg:pt-8">
        {viewingProjectId ? (
          <FacultyFileViewer 
            projectId={viewingProjectId} 
            onBack={() => {
              setViewingProjectId(null);
              fetchDashboardData();
            }}
            onStatusUpdate={() => {
              fetchDashboardData();
              fetchRequests();
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {facultyData?.name}!</h1>
                  <p className="text-slate-600">Here's an overview of your project reviews</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard 
                    icon={FolderOpen} 
                    count={dashboardSummary.totalAssigned} 
                    label="Total Projects" 
                    subtitle="All assigned projects"
                    color="bg-slate-900"
                  />
                  <StatCard 
                    icon={Clock} 
                    count={dashboardSummary.pendingRequests} 
                    label="Pending Review" 
                    subtitle="Awaiting your decision"
                    color="bg-amber-500"
                  />
                  <StatCard 
                    icon={CheckCircle} 
                    count={dashboardSummary.approved} 
                    label="Accepted" 
                    subtitle="Approved projects"
                    color="bg-emerald-500"
                  />
                  <StatCard 
                    icon={XCircle} 
                    count={dashboardSummary.rejected} 
                    label="Rejected" 
                    subtitle="Declined projects"
                    color="bg-red-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Pending Requests</h2>
                      <p className="text-sm text-slate-500 mt-1">{requests.length} projects awaiting review</p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('requests');
                        fetchRequests();
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {requests.slice(0, 4).length > 0 ? (
                      requests.slice(0, 4).map(project => (
                        <ProjectRequestCard key={project.projectId} project={project} />
                      ))
                    ) : (
                      <div className="col-span-2 bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
                        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending requests</h3>
                        <p className="text-sm text-slate-500">All projects have been reviewed</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'requests' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">All Pending Requests</h2>
                  <p className="text-sm text-slate-500 mt-1">{requests.length} projects awaiting review</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {requests.length > 0 ? (
                    requests.map(project => (
                      <ProjectRequestCard key={project.projectId} project={project} />
                    ))
                  ) : (
                    <div className="col-span-2 bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
                      <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending requests</h3>
                      <p className="text-sm text-slate-500">All projects have been reviewed</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default FacultyDashboard
