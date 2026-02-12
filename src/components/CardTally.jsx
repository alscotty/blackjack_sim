import React, { useMemo, useState } from 'react';

export default function CardTally({ unseenOthers, unseenTens }) {
  const [showCardTally, setShowCardTally] = useState(true);

  const othersTensAdvantageTable = useMemo(
    () => [
      { othersPerTen: 3, advantagePct: -2 },
      { othersPerTen: 2.25, advantagePct: 0.1 },
      { othersPerTen: 2, advantagePct: 1 },
      { othersPerTen: 1.75, advantagePct: 2 },
      { othersPerTen: 1.63, advantagePct: 3 },
      { othersPerTen: 1.5, advantagePct: 4 },
      { othersPerTen: 1.35, advantagePct: 5 },
      { othersPerTen: 1.25, advantagePct: 6 },
      { othersPerTen: 1.16, advantagePct: 7 },
      { othersPerTen: 1.08, advantagePct: 8 },
      { othersPerTen: 1, advantagePct: 9 }
    ],
    []
  );

  const ratio =
    unseenTens > 0 ? (unseenOthers / unseenTens).toFixed(2) : '—';

  return (
    <div className="card-tally">
      <h3>Card Tally</h3>
      <button
        onClick={() => setShowCardTally((prev) => !prev)}
        className="toggle-tally-btn"
      >
        {showCardTally ? 'Hide Numbers' : 'Show Numbers'}
      </button>
      {showCardTally && (
        <div className="card-tally-content">
          <p>Unseen Others: {unseenOthers}</p>
          <p>Unseen Tens: {unseenTens}</p>
          <p>Ratio (Others to Tens): {ratio}</p>
          <table className="others-tens-advantage-table">
            <thead>
              <tr>
                <th>Others/Tens</th>
                <th>Normal approximate advantage (in %)</th>
              </tr>
            </thead>
            <tbody>
              {othersTensAdvantageTable.map((row) => (
                <tr key={row.othersPerTen}>
                  <td>{row.othersPerTen}</td>
                  <td>{row.advantagePct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

