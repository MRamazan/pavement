"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  X,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileImage,
  ChevronRight,
  Shield,
  Clock,
  DollarSign,
  Users,
  Wrench,
  Tag,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { PriorityBadge, SeverityBar } from "@/components/ui/PriorityBadge";
import { createTicket } from "@/lib/ticketStore";
import { CATEGORY_LABELS } from "@/types";
import type { AIAnalysis, GeoLocation } from "@/types";

type Step = "upload" | "details" | "analyzing" | "result";

const GROQ_API_KEY_STORAGE = "pavement_groq_key";

export function ReportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [userDescription, setUserDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState(0);

  const analysisStages = [
    "Processing image...",
    "Identifying infrastructure issue...",
    "Calculating priority score...",
    "Generating repair recommendations...",
    "Finalizing ticket...",
  ];

  useEffect(() => {
    const savedKey = localStorage.getItem(GROQ_API_KEY_STORAGE);
    if (savedKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount sync from localStorage
      setApiKey(savedKey);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      // Extract base64 for API
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
    setStep("details");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64 && !userDescription.trim()) {
      setError("Please provide an image or a description of the issue.");
      return;
    }

    if (apiKey.trim()) {
      localStorage.setItem(GROQ_API_KEY_STORAGE, apiKey.trim());
    }
    setError(null);
    setStep("analyzing");
    setAnalysisStage(0);

    // Simulate staged progress
    const stageInterval = setInterval(() => {
      setAnalysisStage((prev) => Math.min(prev + 1, analysisStages.length - 1));
    }, 1200);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64 || "",
          userDescription: userDescription.trim() || undefined,
          apiKey: apiKey.trim(),
        }),
      });

      clearInterval(stageInterval);
      setAnalysisStage(analysisStages.length - 1);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      await new Promise((r) => setTimeout(r, 500));
      setStep("result");
    } catch (err) {
      clearInterval(stageInterval);
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(
        msg.includes("API key") || msg.includes("401")
          ? "Invalid Groq API key. Please check and try again."
          : msg
      );
      setStep("details");
    }
  };

  const handleCreateTicket = () => {
    if (!analysis) return;

    const id = uuidv4();
    const now = new Date().toISOString();

    const location: GeoLocation = {
      address: locationText || undefined,
      neighborhood: neighborhood || undefined,
      city: city || undefined,
    };

    const ticket = createTicket({
      id,
      createdAt: now,
      status: "OPEN",
      imageBase64: imagePreview || "",
      userDescription: userDescription || undefined,
      location,
      analysis,
    });

    setCreatedTicketId(ticket.id);
  };

  const handleViewTicket = () => {
    if (createdTicketId) {
      router.push(`/admin?ticket=${createdTicketId}`);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setImageFile(null);
    setImagePreview(null);
    setImageBase64("");
    setUserDescription("");
    setLocationText("");
    setNeighborhood("");
    setCity("");
    setAnalysis(null);
    setError(null);
    setCreatedTicketId(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* API Key Banner (optional / advanced) */}
      {showApiKeyInput && (
        <div
          className="mb-6 p-4 rounded-xl animate-fade-in-up"
          style={{
            background: "var(--accent-light)",
            border: "1px solid var(--accent)",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  Use your own Groq API key (optional)
                </p>
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ✕
                </button>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                This demo already works without one. Get a free key at{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  console.groq.com
                </a>{" "}
                only if you want to use your own quota instead of the shared demo key. Stored locally, never sent to our servers.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  onClick={() => {
                    if (apiKey.trim()) {
                      localStorage.setItem(GROQ_API_KEY_STORAGE, apiKey.trim());
                      setShowApiKeyInput(false);
                      setError(null);
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent)" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle to reveal the optional API key field */}
      {!showApiKeyInput && (
        <button
          onClick={() => setShowApiKeyInput(true)}
          className="mb-4 text-xs underline"
          style={{ color: "var(--text-secondary)" }}
        >
          {apiKey ? "Using your own Groq API key" : "Use your own Groq API key instead"}
        </button>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="animate-fade-in-up">
          <div
            className={`upload-zone rounded-2xl p-12 text-center cursor-pointer ${
              isDragging ? "drag-over" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div
              className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
              style={{
                width: "64px",
                height: "64px",
                background: "var(--accent-light)",
              }}
            >
              <Upload size={28} style={{ color: "var(--accent)" }} />
            </div>
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Upload a photo of the issue
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Drag & drop or click to browse · JPG, PNG, WEBP · Max 10MB
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                }}
              >
                <FileImage size={14} />
                Choose File
              </button>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                or drag here
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              style={{ top: "50%", height: "1px", background: "var(--border)" }}
            />
            <div className="relative flex justify-center">
              <span
                className="px-3 text-xs"
                style={{ color: "var(--text-secondary)", background: "var(--bg)" }}
              >
                or report without a photo
              </span>
            </div>
          </div>

          <button
            onClick={() => setStep("details")}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
            }}
          >
            Describe the issue with text only →
          </button>

          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: "var(--accent)" }}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <div className="animate-fade-in-up space-y-5">
          {/* Image preview */}
          {imagePreview && (
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              <img
                src={imagePreview}
                alt="Uploaded issue"
                className="w-full object-cover"
                style={{ maxHeight: "280px" }}
              />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 p-1.5 rounded-full transition-colors"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <X size={14} color="white" />
              </button>
              {imageFile && (
                <div
                  className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  <Camera size={11} className="inline mr-1" />
                  {imageFile.name}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Describe the problem{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                (optional, helps AI accuracy)
              </span>
            </label>
            <textarea
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder="e.g. 'Large pothole near bus stop, cars swerving to avoid it. Has been here for 2 weeks.'"
              rows={3}
              className="w-full text-sm px-4 py-3 rounded-xl outline-none resize-none transition-colors"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              <MapPin
                size={13}
                className="inline mr-1"
                style={{ color: "var(--text-secondary)" }}
              />
              Location{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Street address or landmark"
              className="w-full text-sm px-4 py-3 rounded-xl outline-none mb-2"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Neighborhood"
                className="w-full text-sm px-4 py-3 rounded-xl outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full text-sm px-4 py-3 rounded-xl outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>


          {error && (
            <p className="text-sm" style={{ color: "var(--accent)" }}>
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!imageBase64 && !userDescription.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Analyze with AI
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Analyzing */}
      {step === "analyzing" && (
        <div className="animate-fade-in-up text-center py-16">
          <div
            className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
            style={{
              width: "72px",
              height: "72px",
              background: "var(--accent-light)",
            }}
          >
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            AI Analysis in Progress
          </h2>
          <p
            className="text-sm transition-all duration-500"
            style={{ color: "var(--text-secondary)" }}
          >
            {analysisStages[analysisStage]}
          </p>
          <div
            className="mt-6 mx-auto rounded-full overflow-hidden"
            style={{
              width: "200px",
              height: "4px",
              background: "var(--border)",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${((analysisStage + 1) / analysisStages.length) * 100}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && analysis && (
        <div className="animate-fade-in-up space-y-5">
          {/* Success header */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: createdTicketId ? "#ECFDF5" : "var(--accent-light)",
              border: `1px solid ${createdTicketId ? "#A7F3D0" : "var(--border)"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <CheckCircle
                size={20}
                style={{ color: createdTicketId ? "#059669" : "var(--accent)" }}
              />
              <span
                className="font-semibold"
                style={{
                  color: createdTicketId ? "#059669" : "var(--accent)",
                }}
              >
                {createdTicketId
                  ? "Ticket created successfully!"
                  : "Analysis complete"}
              </span>
            </div>
            <p className="text-sm ml-8" style={{ color: "var(--text-secondary)" }}>
              {analysis.issueSummary}
            </p>
          </div>

          {/* Priority + score */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <PriorityBadge
                priority={analysis.priority}
                score={analysis.priorityScore}
                size="lg"
                showScore
              />
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  AI Confidence
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
            </div>
            <SeverityBar
              score={analysis.priorityScore}
              priority={analysis.priority}
            />
            {analysis.safetyRisk && (
              <div
                className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg"
                style={{ background: "#FEF2F2", color: "#DC2626" }}
              >
                <Shield size={12} />
                Active safety risk - requires immediate attention
              </div>
            )}
          </div>

          {/* Details grid */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {CATEGORY_LABELS[analysis.issueType]}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {analysis.detailedDescription}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                icon={Clock}
                label="Response Time"
                value={analysis.urgencyWindow}
              />
              <InfoCard
                icon={DollarSign}
                label="Est. Repair Cost"
                value={analysis.estimatedRepairCost}
              />
              <InfoCard
                icon={Users}
                label="Affected Population"
                value={analysis.affectedPopulation}
              />
              <InfoCard
                icon={Wrench}
                label="Action Required"
                value={analysis.recommendedAction}
                multiLine
              />
            </div>

            {/* Priority reason */}
            <div
              className="p-3 rounded-xl text-xs"
              style={{
                background: "var(--bg)",
                color: "var(--text-secondary)",
              }}
            >
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Priority rationale:{" "}
              </span>
              {analysis.priorityReason}
            </div>

            {/* Tags */}
            {analysis.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Tag
                  size={12}
                  className="self-center"
                  style={{ color: "var(--text-secondary)" }}
                />
                {analysis.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
              }}
            >
              New Report
            </button>

            {!createdTicketId ? (
              <button
                onClick={handleCreateTicket}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                <CheckCircle size={16} />
                Submit Ticket
              </button>
            ) : (
              <button
                onClick={handleViewTicket}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#059669" }}
              >
                View in Admin Panel
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  multiLine = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  multiLine?: boolean;
}) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color: "var(--text-secondary)" }} />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      </div>
      <p
        className={`text-xs font-medium ${multiLine ? "" : "truncate"}`}
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
