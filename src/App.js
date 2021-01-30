import React, { useState, useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'
import Webcam from 'react-webcam';
import './App.css';

const MODEL_URL = '/models'

const videoConstraints = {
  width: 350,
  height: 350,
  facingMode: 'user',
};

export default function App() {
  const overlayCanvas = useRef()
  const webcam = useRef()

  useEffect(() => {
    loadModels()
  })

  let [withBoxes, setWithBoxes] = useState(true)

  async function loadModels() {
    await faceapi.loadFaceDetectionModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  }

  setInterval(async () => {
    try {
      // Webcam could drop out occasionally, better put in try-catch block
      const video = webcam.current.video
      const canvas = overlayCanvas.current

      let options = new faceapi.TinyFaceDetectorOptions()

      const result = await faceapi.detectSingleFace(video, options).withFaceLandmarks()
      if (result) {
        const dims = faceapi.matchDimensions(canvas, video, true)
        const resizedResult = faceapi.resizeResults(result, dims)

        if (withBoxes) {
          faceapi.draw.drawDetections(canvas, resizedResult)
        }
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult)
      }
    } catch (err) {
      console.error(err)
    }
  }, 100)

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcam}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="webcam"
      />
      <canvas className="overlay" ref={overlayCanvas} />
    </div>
  )
}
