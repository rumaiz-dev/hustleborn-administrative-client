import React, { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
const modules = {
  toolbar: [
    [{ font: [] }, { size: ["small", "normal", "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ header: [1, 2, 3, false] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "font", "size", "color", "background",
  "bold", "italic", "underline", "strike",
  "header", "list",
  "link", "image",
];

export default function RichTextField({ value, onChange, placeholder }) {
  const quillRef = useRef(null);

  return (
    <div className="form-control p-0 mb-0">
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
    />
    </div>
  );
}
