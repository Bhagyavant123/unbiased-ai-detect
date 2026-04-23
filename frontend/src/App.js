import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [showFixed, setShowFixed] = useState(false);

  const handleDetect = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/process", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setData(result);
    setShowFixed(false);
  };

  return (
    <div className="container">
      <h1>FairSight AI</h1>

      <div className="card">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <br />
        <button onClick={handleDetect}>Detect Bias</button>
        <button onClick={() => setShowFixed(true)}>Fix Bias</button>
      </div>

      {/* SUMMARY */}
      {data && (
        <div className="card">
          <h2>🔍 Bias Summary</h2>
          <p><b>Status:</b> {data.bias.status}</p>
          <p><b>Bias Score:</b> {(data.bias.score * 100).toFixed(1)}%</p>
          <p><b>Disparate Impact:</b> {data.bias.disparate_impact}</p>

          <p><b>Male Rate (Before):</b> {((data.bias.where.male_selected / data.bias.where.male_total) * 100).toFixed(1)}%</p>
          <p><b>Female Rate (Before):</b> {((data.bias.where.female_selected / data.bias.where.female_total) * 100).toFixed(1)}%</p>

          <p><b>Reason:</b> {data.bias.reason}</p>
        </div>
      )}

      {/* BEFORE TABLE */}
      {data && (
        <div className="card">
          <h2>📊 Before Dataset</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                {Object.keys(data.preview[0]).map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.preview.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {Object.entries(row).map(([key, val], j) => (
                    <td key={j}>
                      {key === "Prediction"
                        ? val === 1 ? "✔ Selected" : "✖ Rejected"
                        : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AFTER TABLE */}
      {showFixed && data && (
        <div className="card">
          <h2>✅ After Dataset</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                {Object.keys(data.fixed_data[0]).map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.fixed_data.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {Object.entries(row).map(([key, val], j) => (
                    <td key={j}>
                      {key === "FixedPrediction"
                        ? val === 1 ? "✔ Selected" : "✖ Rejected"
                        : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AFTER METRICS */}
      {showFixed && data && (
        <div className="card">
          <h2>📈 After Fix</h2>
          <p><b>Male Rate:</b> {(data.after.male * 100).toFixed(1)}%</p>
          <p><b>Female Rate:</b> {(data.after.female * 100).toFixed(1)}%</p>
          <p><b>Bias Gap:</b> {(data.after.bias * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;