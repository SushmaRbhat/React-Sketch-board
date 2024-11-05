import { useEffect, useRef, useState } from "react";
import "./Board.css";
import ToolBar from "./ToolBar";
import { socket } from "../socket";

function Board() {
  const canvasRef = useRef(null); // Ref for accessing the canvas element
  const contextRef = useRef(null); // Ref for storing the drawing context
  const [isDrawing, setIsDrawing] = useState(false); // State to track drawing status
  const [stokeColor, setStrokeColor] = useState("#212121");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [eraser, setEraser] = useState(false);
  const [text, setText] = useState(null);
  const [shape, setShape] = useState(null);
  const [saveData, setSaveData] = useState(null);
  const [drawHistory, setDrawHistory] = useState([]);

  const [historyPtr, setHistoryPtr] = useState(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth; // Set canvas width
    canvas.height = window.innerHeight; // Set canvas height
    // Set up the context for drawing
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = stokeColor;
    context.lineWidth = strokeWidth;
    contextRef.current = context;
    saveState();
    const handleBeginPath = (path) => {
      context.beginPath();
      context.moveTo(path.x, path.y);
    };

    const handleDrawLine = (path) => {
      if (path.shape == null) {
        context.lineTo(path.x, path.y);
        context.stroke();
      }
    };

    socket.on("beginPath", handleBeginPath);
    socket.on("drawLine", handleDrawLine);

    return () => {
      socket.off("beginPath", handleBeginPath);
      socket.off("drawLine", handleDrawLine);
    };
  }, []);

  useEffect(() => {
    const handleConfig = (color, width) => {
      contextRef.current.strokeStyle = eraser ? "#fff" : color;
      contextRef.current.lineWidth = eraser ? 10 : width;
    };
    handleConfig(stokeColor, strokeWidth);
    const handleChangeColor = (path) => {
      handleConfig(path.color, path.width);
    };
    socket.on("changeConfig", handleChangeColor);
    socket.emit("changeConfig", {
      color: stokeColor,
      width: strokeWidth,
    });
    return () => {
      socket.off("changeConfig", handleChangeColor);
    };
  }, [stokeColor, eraser, strokeWidth]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Add the new state to the history,
    const newHistory = [...drawHistory];
    setDrawHistory([...newHistory, imageData]);
    setHistoryPtr(newHistory.length); // Move pointer to the new end of history
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);
    if (shape === null) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    } else {
      const context = contextRef.current;
      const imgData = context.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setSaveData(imgData);
    }

    socket.emit("beginPath", {
      x: offsetX,
      y: offsetY,
      startPos: startPos,
    });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return; // Only draw when mouse is pressed
    const { offsetX, offsetY } = nativeEvent;
    if (shape === null) {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    } else {
      drawShape(offsetX, offsetY);
    }
    socket.emit("drawLine", {
      x: offsetX,
      y: offsetY,
      shape: shape,
    });
  };

  const endDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (shape) {
      setSaveData(null);
    }
    contextRef.current.closePath();

    saveState();
  };

  const selectShape = (shapeType) => {
    setShape(shapeType);
    setEraser(false);
  };
  const selectPencil = () => {
    setShape(null);
    setEraser(false);
  };
  const selectEraser = () => {
    setShape(null);
    setEraser(!eraser);
  };
  const handleColor = (color) => {
    setStrokeColor(color);
  };
  const handleStrokeSize = (width) => {
    setStrokeWidth(width);
  };
  const drawShape = (x, y) => {
    const context = contextRef.current;

    context.putImageData(saveData, 0, 0);
    let side;
    const { x: startX, y: startY } = startPos;
    context.beginPath();
    switch (shape) {
      case "square":
        side = Math.max(Math.abs(x - startX), Math.abs(y - startY));
        context.strokeRect(startX, startY, side, side);
        break;
      case "circle":
        const radius =
          Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)) / 2;
        context.beginPath();
        context.arc(startX, startY, radius, 0, Math.PI * 2);
        break;
      case "triangle":
        context.moveTo(startX, startY);
        context.lineTo(x, y);
        context.lineTo(2 * startX - x, y);
        context.closePath();

        break;
      case "line": {
        context.moveTo(startX, startY);
        context.lineTo(x, y);
        break;
      }
      default:
        break;
    }
    context.stroke();
  };

  const handleUndo = () => {
    if (historyPtr <= 0) return; //  undos not available
    const context = contextRef.current;
    // decrement the pointer back and restore the previous state
    setHistoryPtr((prev) => prev - 1);
    const previousImageData = drawHistory[historyPtr - 1];
    context.putImageData(previousImageData, 0, 0);
  };
  const handleRedo = () => {
    if (historyPtr >= drawHistory.length - 1) return; //  redos not available 6>6
    const context = contextRef.current;
    // increment pointer  and restore the next state
    const nextImageData = drawHistory[historyPtr + 1];
    setHistoryPtr((prev) => prev + 1);
    context.putImageData(nextImageData, 0, 0);
  };
  return (
    <div className="board-container">
      <ToolBar
        stokeColor={stokeColor}
        setStrokeColor={handleColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={handleStrokeSize}
        shape={shape}
        eraser={eraser}
        selectEraser={selectEraser}
        selectPencil={selectPencil}
        selectShape={selectShape}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        pointer={historyPtr}
        history={drawHistory}
      />
      <canvas
        style={{
          overscrollBehavior: "none",
          cursor: "crosshair",
        }}
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing} // Stop drawing if mouse leaves canvas
      />
    </div>
  );
}

export default Board;