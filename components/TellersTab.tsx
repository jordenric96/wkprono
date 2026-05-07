// src/components/TellersTab.tsx
export default function TellersTab({ tellersData }: any) {
  return (
    <div className="teller-grid">
      <div className="teller-card" style={{gridColumn: 'span 2'}}>
        <div className="teller-val">{tellersData.totaleGoals}</div>
        <div className="teller-label">Totaal Aantal Doelpunten</div>
      </div>
      
      <div className="teller-card" style={{background: '#FFD43B', color: '#111827'}}>
        <div className="teller-val">{tellersData.totaleGeleKaarten}</div>
        <div className="teller-label">Gele Kaarten</div>
      </div>
      
      <div className="teller-card" style={{background: '#FA5252'}}>
        <div className="teller-val">{tellersData.totaleRodeKaarten}</div>
        <div className="teller-label">Rode Kaarten</div>
      </div>

      <div className="teller-card" style={{background: '#40C057', gridColumn: 'span 2'}}>
        <div className="teller-label">MEEST SCOREND TEAM</div>
        <div className="teller-val" style={{fontSize: '2.5rem', margin: '5px 0'}}>{tellersData.meestScorendTeam[0]}</div>
        <div style={{fontWeight: 900}}>{tellersData.meestScorendTeam[1]} Doelpunten</div>
      </div>

      <div className="teller-card" style={{background: '#228BE6', gridColumn: 'span 2'}}>
        <div className="teller-label">BESTE VERDEDIGING (MINSTE TEGEN)</div>
        <div className="teller-val" style={{fontSize: '2.5rem', margin: '5px 0'}}>{tellersData.minstTegenTeam[0]}</div>
        <div style={{fontWeight: 900}}>{tellersData.minstTegenTeam[1]} Tegendoelpunten</div>
      </div>
    </div>
  );
}