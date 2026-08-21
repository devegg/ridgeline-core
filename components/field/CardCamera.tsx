'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Business cards are 3.5 × 2 inches. The guide matches, so what you line up
    is what gets kept. */
const CARD_RATIO = 3.5 / 2
/** Fraction of the preview width the guide occupies. 0.86, not 0.9, and the
    CSS must match exactly: at 0.9 a 3.5:2 crop is taller than 90% of a 16:9
    frame — the commonest phone stream — so the safety clamp below fires and
    silently shrinks the crop away from the rectangle the user framed. */
const GUIDE_WIDTH = 0.86
/** Long edge of the saved crop. Plenty for OCR and for reading it later. */
const MAX_EDGE = 1600

type Status = 'starting' | 'live' | 'blocked'

/**
 * In-page camera with a card-shaped framing guide.
 *
 * The obvious approach — `<input capture="environment">` — hands off to the
 * phone's camera app, where nothing can be drawn over the viewfinder and the
 * photo comes back with the whole desk in it. Owning the preview means the
 * crop is deterministic: the pixels inside the guide are exactly the pixels
 * saved, so there is no edge detection to misfire and no manual crop step
 * while a prospect watches.
 *
 * Camera access can be refused or unavailable (permission denied, insecure
 * origin, locked-down browser). That is not an error worth blocking on —
 * `onFallback` hands the job back to the plain file input.
 */
export function CardCamera({
  onCapture, onCancel, onFallback,
}: {
  onCapture: (file: File) => void
  onCancel: () => void
  onFallback: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<Status>('starting')

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('blocked')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setStatus('live')
      } catch {
        if (!cancelled) setStatus('blocked')
      }
    }

    start()
    return () => { cancelled = true; stop() }
  }, [stop])

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    // The <video> box keeps the stream's intrinsic ratio (width:100%, height
    // auto, no max-height), so the displayed frame and the element are the
    // same rectangle. That makes the CSS guide and this crop the same region
    // by construction rather than by coincidence — the guarantee the whole
    // feature rests on. Changing either the CSS width or GUIDE_WIDTH alone
    // breaks it silently.
    const vw = video.videoWidth
    const vh = video.videoHeight

    let cropW = vw * GUIDE_WIDTH
    let cropH = cropW / CARD_RATIO
    if (cropH > vh * 0.9) {
      cropH = vh * 0.9
      cropW = cropH * CARD_RATIO
    }

    const scale = Math.min(1, MAX_EDGE / cropW)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(cropW * scale)
    canvas.height = Math.round(cropH * scale)

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(
      video,
      (vw - cropW) / 2, (vh - cropH) / 2, cropW, cropH,
      0, 0, canvas.width, canvas.height
    )

    canvas.toBlob(blob => {
      if (!blob) return
      stop()
      onCapture(new File([blob], `card-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  }

  if (status === 'blocked') {
    return (
      <div className="field-scan">
        <p className="field-scan__note">
          I couldn&rsquo;t open the camera here — your browser may have blocked it.
          Use the phone&rsquo;s own camera instead; frame the card tightly and it&rsquo;ll
          still read fine.
        </p>
        <button type="button" className="field-camera" onClick={onFallback}>
          <span className="field-camera__icon" aria-hidden="true">📷</span>
          Use the phone camera
        </button>
        <button type="button" className="field-linkbtn" onClick={onCancel}>Cancel</button>
      </div>
    )
  }

  return (
    <div className="field-cam">
      <div className="field-cam__stage">
        <video ref={videoRef} className="field-cam__video" playsInline muted />
        <div className="field-cam__guide" aria-hidden="true" />
      </div>
      <p className="field-scan__note">
        {status === 'starting'
          ? 'Starting the camera…'
          : 'Fill the frame with the card. Everything outside it is thrown away.'}
      </p>
      <button type="button" className="field-camera" onClick={capture} disabled={status !== 'live'}>
        <span className="field-camera__icon" aria-hidden="true">📷</span>
        Capture
      </button>
      <button type="button" className="field-linkbtn" onClick={() => { stop(); onCancel() }}>Cancel</button>
    </div>
  )
}
