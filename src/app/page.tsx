'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Page() {
  const [modal, setModal] = useState<'free' | 'premium' | null>(null)

  const openModal = (type: 'free' | 'premium') => setModal(type)
  const closeModal = () => setModal(null)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">드럼 연습 웹서비스</h1>

      <div className="space-y-4">
        <Button className="w-full" onClick={() => openModal('free')}>
          🎧 영상 악보 변환 (무료 체험)
        </Button>
        <Button className="w-full" onClick={() => openModal('premium')}>
          💰 영상 모음 (유료 학습 콘텐츠)
        </Button>
      </div>

      <Dialog open={!!modal} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === 'free'
                ? '무료 영상 변환 체험'
                : '유료 영상 학습 콘텐츠'}
            </DialogTitle>
          </DialogHeader>

          {modal === 'free' && (
            <div className="space-y-2 mt-4">
              <p>유튜브 영상 링크를 입력하고 간단한 드럼 악보를 확인해보세요!</p>
              <input
                type="text"
                placeholder="https://youtube.com/..."
                className="border rounded w-full px-3 py-2"
              />
              <Button className="mt-2">악보 생성</Button>
            </div>
          )}

          {modal === 'premium' && (
            <div className="space-y-2 mt-4">
              <p>제공자와 협약된 멋진 연주 영상을 보고 학습 자료를 구매해보세요.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>각 영상에 루디먼트 연습자료 포함</li>
                <li>PDF + 드럼 악보 + 설명 제공</li>
              </ul>
              <Button className="mt-2">학습자료 모음 보기</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
