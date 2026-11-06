import React from "react";
import { X, Award, Printer, Share2, CheckCircle2, Sparkles } from "lucide-react";
import { BuddhismCourse } from "../../types/buddhismCourse";

interface CourseCertificateModalProps {
  course: BuddhismCourse;
  studentName: string;
  studentEmail: string;
  onClose: () => void;
}

export function CourseCertificateModal({
  course,
  studentName,
  onClose
}: CourseCertificateModalProps) {
  const certId = `DHAMMA-${course.id.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/learn?cert=${certId}`
      );
      alert("Certificate verification link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden print:border-none print:shadow-none">
        {/* Top Control Bar (hidden in print) */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-neutral-900">
              Verified Dhamma Completion Certificate
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              title="Share verification link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-8 sm:p-12 bg-[#FCFAF6] border-8 border-double border-amber-900/30 m-4 rounded-xl relative overflow-hidden text-center print:m-0 print:border-4">
          {/* Subtle Background Watermark / Lotus Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
            <Award className="w-96 h-96 text-amber-900" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header / Seal */}
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100/80 border-2 border-amber-300 text-amber-900 mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-amber-900 font-serif">
                Sri Lankan Community Dhamma Academy
              </h2>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 tracking-tight">
                Certificate of Dhamma Study
              </h1>
              <p className="text-xs text-neutral-500 italic">
                This is to certify that the dedicated practitioner
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2 border-b-2 border-amber-200/80 max-w-md mx-auto">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-950">
                {studentName || "Dhamma Student"}
              </span>
            </div>

            {/* Course Information */}
            <div className="space-y-2 max-w-lg mx-auto text-xs text-neutral-700 leading-relaxed">
              <p>
                has successfully completed all modules, practical mindfulness exercises, and canonical knowledge assessments for the training course:
              </p>
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 font-serif">
                "{course.title}"
              </h3>
              <p className="text-[11px] text-neutral-500">
                Course Category: {course.category} · Curriculum Reference: {course.source.name}
              </p>
            </div>

            {/* Signatures & Verification Row */}
            <div className="pt-8 grid grid-cols-3 items-end text-center text-xs border-t border-neutral-200/80 max-w-lg mx-auto gap-4">
              <div>
                <p className="font-serif italic font-bold text-neutral-800">
                  {course.instructor.name}
                </p>
                <div className="h-px bg-neutral-300 my-1 w-24 mx-auto" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                  Course Instructor
                </span>
              </div>

              <div>
                <div className="w-12 h-12 rounded-full border border-amber-300 bg-amber-50 flex items-center justify-center mx-auto mb-1 text-amber-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest block">
                  Verified Seal
                </span>
              </div>

              <div>
                <p className="font-medium text-neutral-800 tabular-nums">
                  {issueDate}
                </p>
                <div className="h-px bg-neutral-300 my-1 w-24 mx-auto" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                  Issue Date
                </span>
              </div>
            </div>

            {/* Verification Code */}
            <div className="pt-4 text-[10px] text-neutral-400 font-mono">
              Certificate Verification ID: {certId} · Authenticated via Theravada Canonical Curriculum
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
