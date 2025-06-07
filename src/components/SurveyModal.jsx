import React from 'react';
import { createPortal } from 'react-dom';

export default function SurveyModal({ isOpen, onClose, filename, jsonData }) {
  if (!isOpen) return null;

  const submitFeedback = async (isConfirmed) => {
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("json_data", JSON.stringify(jsonData));
    formData.append("is_confirmed", isConfirmed);

    try {
      const response = await fetch("https://rudilick-backend.onrender.com/survey-feedback/", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      alert(result.message);
      onClose(); // 설문 닫기
    } catch (err) {
      alert("설문 제출 실패: " + err.message);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">전사 결과는 어땠나요?</h2>
        <p className="mb-6 text-sm">이 설문은 정확한 학습 데이터 수집을 위한 것입니다.</p>
        <div className="flex justify-around gap-4">
          <button
            onClick={() => submitFeedback(true)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex flex-col items-center"
          >
            <img src="/survey/thumbs-up.png" alt="완벽해요" className="w-12 h-12 mb-1" />
            완벽해요
          </button>
          <button
            onClick={() => submitFeedback(false)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-2 px-4 rounded-lg flex flex-col items-center"
          >
            <img src="/survey/thinking-face.png" alt="부족해요" className="w-12 h-12 mb-1" />
            부족해요
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}