import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as blazeface from "@tensorflow-models/blazeface";
import * as tf from "@tensorflow/tfjs";

const App: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    };
    tf.ready().then(loadModel);
  }, []);

  const detectFaces = async () => {
    if (webcamRef.current && canvasRef.current && model) {
      const video = webcamRef.current.video;
      if (video && video.readyState === 4) {
        const predictions = await model.estimateFaces(video, false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          predictions.forEach((prediction) => {
            const start = prediction.topLeft as [number, number];
            const end = prediction.bottomRight as [number, number];
            const size = [end[0] - start[0], end[1] - start[1]];

            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.rect(start[0], start[1], size[0], size[1]);
            ctx.stroke();
          });
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ marginLeft: 550, fontFamily: "Playwrite HR Lijeva" }}>Real-Time Facial Recognition</h1>
      <div style={{ position: "relative", display: "inline-block" }}>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 8,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </div>
    </div>
  );
};

export default App;