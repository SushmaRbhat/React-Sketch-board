import React from "react";
import { FaEraser } from "react-icons/fa";
import { BsCircle, BsTriangle, BsPencil, BsDashLg } from "react-icons/bs";
import { PiLineVerticalBold, PiRectangle, PiTextTBold } from "react-icons/pi";
import { LuUndo2, LuRedo2, LuDownload } from "react-icons/lu";
import "./Board.css";
import { colors, shapes, strokeWidthOptions } from "../const";

const shapeObj = {
  line: <PiLineVerticalBold />,
  rectangle: <PiRectangle />,
  circle: <BsCircle />,
  triangle: <BsTriangle />,
};
const strokeSize = {
  5: "1px",
  10: "1.5px",
  15: "2px",
  20: "2.5px",
};

const ToolBar = ({
  stokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  shape,
  tool,
  selectEraser,
  selectPencil,
  selectShape,
  handleUndo,
  handleRedo,
  handleDownload,
  addText,
  pointer,
  history,
}) => {
  return (
    <div className="toolbar">
      <div>
        <span className="subtitle">Colors</span>
        <div className="color-button-wrapper">
          {colors &&
            colors.map((color) => (
              <button
                key={color}
                className={
                  stokeColor === color ? "color-btn active-btn" : "color-btn"
                }
                style={{ backgroundColor: color }}
                onClick={() => {
                  setStrokeColor(color);
                }}
              ></button>
            ))}
        </div>
      </div>
      <div>
        <span className="subtitle">Stroke width</span>
        <div className="color-button-wrapper ">
          {strokeWidthOptions &&
            strokeWidthOptions.map((wdth) => (
              <button
                key={wdth}
                className={
                  strokeWidth === wdth ? "color-btn active-btn" : "color-btn"
                }
                onClick={() => setStrokeWidth(wdth)}
              >
                <BsDashLg
                  style={{
                    strokeWidth: strokeSize[wdth],
                  }}
                />
              </button>
            ))}
        </div>
      </div>
      <div>
        <span className="subtitle">Tools</span>
        <div className="color-button-wrapper">
          <button
            className={tool === "pencil" ? "color-btn active-btn" : "color-btn"}
            onClick={selectPencil}
          >
            <BsPencil />
          </button>
          <button
            className={tool === "eraser" ? "color-btn active-btn" : "color-btn"}
            onClick={selectEraser}
          >
            <FaEraser />
          </button>
          <button
            className={tool === "text" ? "color-btn active-btn" : "color-btn"}
            onClick={addText}
          >
            <PiTextTBold />
          </button>
        </div>
      </div>
      <div>
        <span className="subtitle">Shapes</span>
        <div className="shape-button-wrapper">
          {shapes &&
            shapes.map((x) => (
              <button
                key={x}
                className={shape === x ? "color-btn active-btn" : "color-btn"}
                onClick={() => selectShape(x)}
              >
                {shapeObj[x]}
              </button>
            ))}
        </div>
      </div>
      <div>
        <span className="subtitle">Actions</span>
        <div className="color-button-wrapper">
          <button
            className="color-btn"
            disabled={pointer <= 0}
            onClick={handleUndo}
          >
            <LuUndo2 />
          </button>
          <button
            className="color-btn"
            disabled={pointer >= history.length - 1}
            onClick={handleRedo}
          >
            <LuRedo2 />
          </button>
        </div>
      </div>
      <div>
        <div className="">
          <button className="color-btn" onClick={handleDownload}>
            <LuDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
