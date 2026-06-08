import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import ReviewPage from "./pages/ReviewPage";

export default function App() {
  const [page, setPage]             = useState("upload");
  const [reviewData, setReviewData] = useState(null);

  const handleAnalyzed = (data) => {
    setReviewData(data);
    setPage("review");
  };

  return (
    <>
      {page === "upload" && <UploadPage onAnalyzed={handleAnalyzed} />}
      {page === "review" && <ReviewPage data={reviewData} onBack={() => setPage("upload")} />}
    </>
  );
}